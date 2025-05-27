
declare global {
	namespace App {
		interface Error {
			message: string;
			status?: number;
		}
		
		interface Locals {
			user: {
				id: string;
				username: string;
				email: string;
			} | null;
		}
		
		interface PageData {
			currentUser?: {
				id: string;
				username: string;
				email: string;
			} | null;
			error?: string;
		}
		
	}
}

export {};
