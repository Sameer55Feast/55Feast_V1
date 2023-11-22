import config from "../../../config/index.js";
import { jwt, messageResponse, onError, sendResponse } from "../utils/index.js";

const middleware = (app) => {
  app.use(async (request, response, next) => {
    const token = request.headers["authorization"].split(" ")[1];
    if (!token) {
      return sendResponse(onError(403, messageResponse.TOKEN_ERROR), response);
    } else {
      const verified = jwt.jwtVerify(token, config.SECRET);
      if (verified) {
        request.user = verified;
        next();
      } else {
        return sendResponse(
          onError(403, messageResponse.TOKEN_EXPIRED),
          response
        );
      }
    }
  });
  return app;
};

export default middleware;
