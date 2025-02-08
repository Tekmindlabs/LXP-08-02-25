import { DefaultRoles } from "@/utils/permissions";
import { SystemMetrics } from "../SystemMetrics";
import { DashboardLayoutConfig } from "@/types/dashboard";

// Import your dashboard components here
const components = {
	SystemMetrics,
	// Add other components as needed
};

export const RoleLayouts: Record<keyof typeof DefaultRoles, DashboardLayoutConfig> = {
	[DefaultRoles.SUPER_ADMIN]: {
		type: "complex",
		components: [
			{
				component: SystemMetrics,
				gridArea: "metrics",
				className: "col-span-full"
			}
		]
	},
	[DefaultRoles.ADMIN]: {
		type: "simple",
		components: [
			{
				component: SystemMetrics,
				gridArea: "metrics",
				className: "col-span-full"
			}
		]
	},
	[DefaultRoles.PROGRAM_COORDINATOR]: {
		type: "simple",
		components: []
	},
	[DefaultRoles.TEACHER]: {
		type: "simple",
		components: []
	},
	[DefaultRoles.STUDENT]: {
		type: "simple",
		components: []
	},
	[DefaultRoles.PARENT]: {
		type: "simple",
		components: []
	}
};