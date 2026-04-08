import { Auth0Client } from "@auth0/nextjs-auth0/server";

/** ログイン成功後の既定の遷移先（Universal Login から戻ったあと） */
export const auth0 = new Auth0Client({
  signInReturnToPath: "/mypage/dashboard",
});
