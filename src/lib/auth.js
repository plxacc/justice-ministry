import DiscordProvider from "next-auth/providers/discord";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: { params: { scope: 'identify guilds guilds.members.read' } },
      // ⚡ حل مشكلة الـ issuer:
      issuer: "https://discord.com",
      token: "https://discord.com/api/oauth2/token",
      userinfo: "https://discord.com/api/users/@me",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.id;

        try {
          const guildId = process.env.GUILD_ID;
          const botToken = process.env.DISCORD_TOKEN || process.env.BOT_TOKEN;

          if (guildId && botToken) {
            const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${profile.id}`, {
              headers: { Authorization: `Bot ${botToken}` },
              cache: 'no-store'
            });

            if (res.ok) {
              const memberData = await res.json();
              token.roles = memberData.roles || [];
            } else {
              token.roles = [];
            }
          } else {
            token.roles = [];
          }
        } catch (error) {
          console.error("Discord Role Fetch Error:", error);
          token.roles = [];
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session && session.user) {
        session.user.id = token.id || token.sub || "";
        session.user.roles = token.roles || [];
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};