import type { Configuration } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: "6aa5cff6-cbad-4275-be83-c6b53e3fb5df", // Your new Client ID
        authority: "https://login.microsoftonline.com/8e30d2cf-b959-406d-b328-3a55a922c219", // Your new Tenant ID
        redirectUri: "http://localhost:5173", 
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
    }
};

// Requirement 2.1.1: Authentication Scopes [cite: 130]
export const loginRequest = {
    scopes: ["openid", "profile", "email", "User.Read"]
};