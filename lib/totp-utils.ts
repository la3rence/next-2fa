import * as OTPAuth from "otpauth"

export interface TOTPSite {
  id: string
  site_name: string
  account_name?: string | null
  secret: string
  color?: string | null
}

export interface TOTPCode {
  id: string
  site_name: string
  account_name?: string | null
  color?: string | null
  code: string
  remainingSeconds: number
}

export function getRemainingSeconds() {
  const now = Math.floor(Date.now() / 1000)
  const timeStep = 30

  return timeStep - (now % timeStep)
}

export function getTOTPCodes(sites: TOTPSite[]): TOTPCode[] {
  return sites.map((site) => {
    try {
      // Create a new TOTP object
      const totp = new OTPAuth.TOTP({
        issuer: site.site_name,
        label: site.account_name || "",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(site.secret),
      })

      // Generate the current TOTP code
      const code = totp.generate()

      return {
        id: site.id,
        site_name: site.site_name,
        account_name: site.account_name,
        color: site.color,
        code,
        remainingSeconds: getRemainingSeconds(),
      }
    } catch (error) {
      console.error(`Error generating TOTP for ${site.site_name}:`, error)
      return {
        id: site.id,
        site_name: site.site_name,
        account_name: site.account_name,
        color: site.color,
        code: "ERROR",
        remainingSeconds: getRemainingSeconds(),
      }
    }
  })
}
