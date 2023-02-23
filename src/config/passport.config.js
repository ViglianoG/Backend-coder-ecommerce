import passport from "passport";
import local from "passport-local";
import GithubStrategy from "passport-github2";
import userModel from "../dao/models/users.model.js";
import cartModel from "../dao/models/cart.model.js";
import jwt from "passport-jwt";
import { createHash, isValidPassword, generateToken } from "../utils.js";

const PRIVATE_KEY = "secret321secret321";

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const cookieExtractor = (req) => {
  const token = req && req.cookies ? req.cookies["cookieToken"] : null;
  return token;
};

const localStrategy = local.Strategy;

const initPassport = () => {
  passport.use(
    "register",
    new localStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        try {
          const { first_name, last_name, email, age, role = "user" } = req.body;
          if (!first_name || !last_name || !email || !age || !password)
            return res.status(400).json({
              status: "error",
              error: "Todos los campos deben ser rellenados",
            });

          const user = await userModel.findOne({ email: username });

          if (user) {
            console.log("User already exists");
            return done(null, false);
          }

          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            role,
          };

          const userCart = await cartModel.create({ products: [] });
          newUser.cart = userCart._id;

          const result = await userModel.create(newUser);
          return done(null, result);
        } catch (error) {
          return done("[LOCAL] Error al crear usuario " + error);
        }
      }
    )
  );

  passport.use(
    "login",
    new localStrategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          if (
            username === "adminCoder@coder.com" &&
            password === "adminCod3r123"
          ) {
            const admin = {
              email: username,
              password,
              first_name: "Admin",
              last_name: "Coder",
              age: 26,
              role: "admin",
            };

            const token = generateToken(admin);
            admin.token = token;
            return done(null, admin);
          }

          const user = await userModel
            .findOne({ email: username })
            .lean()
            .exec();

          if (!user) {
            console.log("Invalid User");
            return done(null, user);
          }

          if (!isValidPassword(user, password)) return done(null, false);

          const token = generateToken(user);
          user.token = token;

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: "Iv1.f0ec593f6296224a",
        clientSecret: "950753c04d89fc54bc5d6092dd6be52369565cd0",
        callbackURL: "http://127.0.0.1:8080/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModel.findOne({ email: profile._json.email });

          if (!user) {
            const newUser = {
              first_name: profile._json.name,
              last_name: "",
              age: 0,
              email: profile._json.email,
              password: "",
            };

            const userCart = await cartModel.create({ products: [] });
            newUser.cart = userCart._id;

            const result = await userModel.create(newUser);

            const token = generateToken(result);
            result.token = token;

            return done(null, result);
          }

          const token = generateToken(user);
          user.token = token;

          done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user);
});

passport.use(
  "current",
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
      secretOrKey: PRIVATE_KEY,
    },
    async (jwt_payload, done) => {
      try {
        return done(null, jwt_payload.user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default initPassport;
