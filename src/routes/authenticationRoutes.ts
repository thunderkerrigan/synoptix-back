import { Router } from "express";
import cookieParser from "cookie-parser";
import expressBasicAuth, { IBasicAuthedRequest } from "express-basic-auth";
import jwt from "jsonwebtoken";

const router = Router();

router.use(cookieParser(process.env.COOKIES_SECRET));

router.get("/", (req, res) => {
  if (req.signedCookies.user) {
    res.send(true);
  } else {
    res.send(false);
  }
});

const auth = expressBasicAuth({
  users: { [process.env.ADMIN_AUTH_USER]: process.env.ADMIN_AUTH_PASSWORD },
});

router.get("/login", auth, async (req: IBasicAuthedRequest, res) => {
  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
    },
    process.env.JWT_SECRET,
    { algorithm: "HS256" }
  );
  res
    .cookie("user", req.auth.user, { signed: true, httpOnly: true })
    .send(token);
});

export default router;
