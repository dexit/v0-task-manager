import {
  PublicClientApplication,
  type AccountInfo,
  InteractionRequiredAuthError,
  BrowserAuthError,
  InteractionType,
} from "@azure/msal-browser"
import { Client } from "@microsoft/microsoft-graph-client"
import { AuthCodeMSALBrowserAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser"

let msalInstance: PublicClientApplication | null = null
let isInteractionInProgress = false

const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
}

const loginRequest = {
  scopes: ["User.Read", "Tasks.Read", "https://dynamics.microsoft.com/user_impersonation"],
}

export async function initializeMsal() {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig)
    try {
      await msalInstance.initialize()
    } catch (error) {
      console.error("Failed to initialize MSAL:", error)
      throw error
    }
  }
  return msalInstance
}

export async function login() {
  try {
    if (isInteractionInProgress) {
      console.warn("Login interaction already in progress. Please wait for it to complete.")
      return null
    }

    isInteractionInProgress = true
    const instance = await initializeMsal()
    if (instance.getAllAccounts().length > 0) {
      // User is already logged in
      isInteractionInProgress = false
      return instance.getAllAccounts()[0]
    }
    const loginResponse = await instance.loginPopup(loginRequest)
    sessionStorage.setItem("msalAccount", JSON.stringify(loginResponse.account))
    isInteractionInProgress = false
    return loginResponse.account
  } catch (err) {
    isInteractionInProgress = false
    if (err instanceof BrowserAuthError && err.errorCode === "interaction_in_progress") {
      console.warn("Login interaction already in progress. Please wait for it to complete.")
      return null
    }
    console.error("Login error:", err)
    throw err
  }
}

export async function logout() {
  try {
    if (isInteractionInProgress) {
      console.warn("Interaction in progress. Please wait before logging out.")
      return
    }

    isInteractionInProgress = true
    const instance = await initializeMsal()
    const account = instance.getActiveAccount()
    if (account) {
      await instance.logoutPopup({
        account: account,
      })
      instance.setActiveAccount(null)
    }
    isInteractionInProgress = false
  } catch (err) {
    isInteractionInProgress = false
    console.error("Logout error:", err)
    throw err
  }
}

export function clearOngoingInteractions() {
  isInteractionInProgress = false
}

export function getActiveAccount(): AccountInfo | null {
  return msalInstance ? msalInstance.getActiveAccount() : null
}

export async function getAuthenticatedClient(): Promise<Client> {
  const instance = await initializeMsal()
  const account = instance.getActiveAccount()
  if (!account) {
    throw new Error("No active account! Verify a user has been signed in and setActiveAccount has been called.")
  }

  const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(instance, {
    account: account,
    scopes: loginRequest.scopes,
    interactionType: InteractionType.Popup,
  })

  return Client.initWithMiddleware({
    authProvider: authProvider,
  })
}

async function getTokenSilently(instance: PublicClientApplication, account: AccountInfo): Promise<string> {
  try {
    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account: account,
    })
    return response.accessToken
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const response = await instance.acquireTokenPopup(loginRequest)
      return response.accessToken
    }
    throw error
  }
}

export async function fetchTasks() {
  try {
    const client = await getAuthenticatedClient()
    const tasksResponse = await client.api("/me/todo/lists").get()
    const tasks = []

    for (const list of tasksResponse.value) {
      const listTasks = await client.api(`/me/todo/lists/${list.id}/tasks`).get()
      tasks.push(...listTasks.value)
    }

    return tasks
  } catch (error) {
    console.error("Error fetching tasks:", error)
    throw error
  }
}

export async function fetchOutlookTasks() {
  try {
    const client = await getAuthenticatedClient()
    const outlookTasksResponse = await client.api("/me/outlook/tasks").get()
    return outlookTasksResponse.value
  } catch (error) {
    console.error("Error fetching Outlook tasks:", error)
    throw error
  }
}

export async function fetchDynamicsTasks() {
  try {
    const instance = await initializeMsal()
    const account = instance.getActiveAccount()
    if (!account) {
      throw new Error("No active account! Please sign in first.")
    }

    const token = await getTokenSilently(instance, account)
    const dynamicsApiUrl = process.env.NEXT_PUBLIC_DYNAMICS_API_URL

    if (!dynamicsApiUrl) {
      throw new Error("Missing Dynamics API URL environment variable")
    }

    const response = await fetch(`${dynamicsApiUrl}/api/data/v9.2/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.value
  } catch (error) {
    console.error("Error fetching Dynamics tasks:", error)
    throw error
  }
}

