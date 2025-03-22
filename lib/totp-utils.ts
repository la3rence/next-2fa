import * as OTPAuth from "otpauth"

interface TOTPSite {
  id: string
  site_name: string
  account_name: string
  secret: string
}

interface TOTPCode extends TOTPSite {
  code: string
}

export async function getTOTPCodes(sites: TOTPSite[]): Promise<TOTPCode[]> {
  return sites.map((site) => {
    try {
      // Create a new TOTP object
      const totp = new OTPAuth.TOTP({
        issuer: site.site_name,
        label: site.account_name,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(site.secret),
      })

      // Generate the current TOTP code
      const code = totp.generate()

      return {
        ...site,
        code,
      }
    } catch (error) {
      console.error(`Error generating TOTP for ${site.site_name}:`, error)
      return {
        ...site,
        code: "ERROR",
      }
    }
  })
}

