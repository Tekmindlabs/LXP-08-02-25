import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { Permission, RolePermissions, DefaultRoles } from "@/utils/permissions";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import type { Session } from "next-auth";

// Extend Session type to include roles
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string[];
      [key: string]: any;
    };
  }
}

export type Context = {
  prisma: typeof prisma;
  session: Session | null;
};

import type { CreateNextContextOptions } from '@trpc/server/adapters/next';

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const session = await getServerAuthSession();

  // Ensure we have the user's roles in the session
  if (session?.user) {
    const userWithRoles = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userRoles: {
          include: {
            role: true
          }
        },
        teacherProfile: true,
        studentProfile: true,
        coordinatorProfile: true,
        parentProfile: true
      }
    });
    
    // Assign default role based on profile type
    let defaultRole = '';
    if (userWithRoles?.teacherProfile) {
      defaultRole = DefaultRoles.TEACHER;
    } else if (userWithRoles?.studentProfile) {
      defaultRole = DefaultRoles.STUDENT;
    } else if (userWithRoles?.coordinatorProfile) {
      defaultRole = DefaultRoles.PROGRAM_COORDINATOR;
    } else if (userWithRoles?.parentProfile) {
      defaultRole = DefaultRoles.PARENT;
    }

    // Combine explicitly assigned roles with default role
    const assignedRoles = userWithRoles?.userRoles?.map(ur => ur.role.name) || [];

    // If user has super-admin role, keep it exclusive
    if (assignedRoles.includes(DefaultRoles.SUPER_ADMIN)) {
      session.user.roles = [DefaultRoles.SUPER_ADMIN];
    } else {
      // Combine assigned roles with default role
      session.user.roles = Array.from(new Set([...assignedRoles, defaultRole].filter(Boolean)));
      
      // If still no roles assigned and user exists, assign default role based on userType
      if (session.user.roles.length === 0 && userWithRoles) {
      if (userWithRoles.teacherProfile) {
        session.user.roles = [DefaultRoles.TEACHER];
      } else if (userWithRoles.studentProfile) {
        session.user.roles = [DefaultRoles.STUDENT];
      } else if (userWithRoles.coordinatorProfile) {
        session.user.roles = [DefaultRoles.PROGRAM_COORDINATOR];
      } else if (userWithRoles.parentProfile) {
        session.user.roles = [DefaultRoles.PARENT];
      } else {
        session.user.roles = [DefaultRoles.STUDENT]; // Fallback role
      }
      }
    }

    console.log('TRPC Context Created:', {
      hasSession: true,
      userId: session.user.id,
      userRoles: session.user.roles,
      defaultRole,
      assignedRoles
    });


  }

  return {
    prisma,
    session,
  };
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    console.error('TRPC Error:', error);
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        code: error.code,
        message: error.message,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});


export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const enforceUserHasPermission = (requiredPermission: Permission) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }

    // Get all permissions for the user's roles
    const userPermissions = ctx.session.user.roles.flatMap(role => {
      // Check if the role exists in RolePermissions
      if (role in RolePermissions) {
        return RolePermissions[role as keyof typeof RolePermissions];
      }
      console.warn(`Unknown role encountered: ${role}`);
      return [];
    });

    console.log('Permission check:', {
      requiredPermission,
      userRoles: ctx.session.user.roles,
      userPermissions,
      hasPermission: userPermissions.includes(requiredPermission)
    });

    if (!userPermissions.includes(requiredPermission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource',
      });
    }

    return next({
      ctx: {
        ...ctx,
        session: {
          ...ctx.session,
          user: {
            ...ctx.session.user,
            permissions: userPermissions
          }
        }
      },
    });
  });

export const permissionProtectedProcedure = (permission: Permission) =>
  t.procedure.use(enforceUserHasPermission(permission));