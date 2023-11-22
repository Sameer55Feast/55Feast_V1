import config from "../../../../config/index.js";
import { tokenModel, userModel } from "../../models/index.js";
import {
  onError,
  onSuccess,
  sendResponse,
  messageResponse,
  globalCatch,
} from "../../utils/index.js";
import axios from "axios";
import SibApiV3Sdk from "sib-api-v3-sdk";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const getAllUsers = async (request, response) => {
  try {
    const { location } = request.query;
    const users = await axios.get(
      `${config.USER_POOL_URL}/all?location=${location}`
    );
    return sendResponse(
      onSuccess(200, messageResponse.USERS_FOUND_SUCCESS, users.data.data),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const getUser = async (request, response) => {
  try {
    const { email } = request.body;
    const options = {
      method: "GET",
      url: `${config.USER_POOL_URL}?email=${email}`,
      headers: { "Content-Type": "application/json" },
      validateStatus: function (status) {
        return (status >= 200 && status < 300) || status === 404;
      },
    };
    const foundUser = await axios.request(options);
    if (foundUser.status === 404) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    return sendResponse(
      onSuccess(200, messageResponse.USER_FOUND, foundUser.data),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const getJoinedUsers = async (request, response) => {
  try {
    const { location } = request.query;
    // exclude this email in user list
    const { email } = request.body;
    const options = {
      method: "GET",
      url: `${config.USER_POOL_URL}/all/joined?location=${location}&email=${email}`,
      headers: { "Content-Type": "application/json" },
    };
    const users = await axios.request(options);
    return sendResponse(
      onSuccess(200, messageResponse.USERS_FOUND_SUCCESS, users.data.data),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const insertUser = async (request, response) => {
  try {
    const { email, fullName, location } = request.body;
    const options = {
      method: "POST",
      url: `${config.USER_POOL_URL}/insert`,
      headers: { "Content-Type": "application/json" },
      data: {
        fullName,
        email,
        location,
      },
      validateStatus: function (status) {
        return (status >= 200 && status < 300) || status === 409;
      },
    };
    const user = await axios.request(options);
    if (user.status === 409) {
      return sendResponse(onError(409, messageResponse.EMAIL_EXIST), response);
    }
    return sendResponse(
      onSuccess(201, messageResponse.CREATED_SUCCESS, user.data.data),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const updateUserPool = async (request, response) => {
  try {
    const { email, fullName, location } = request.body;
    const options = {
      method: "PATCH",
      url: `${config.USER_POOL_URL}/update`,
      headers: { "Content-Type": "application/json" },
      data: { email, location, fullName },
      validateStatus: function (status) {
        return (status >= 200 && status < 300) || status === 404;
      },
    };
    const user = await axios.request(options);
    if (user.status === 404) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    return sendResponse(
      onSuccess(200, messageResponse.USER_UPDATED_SUCCESS, user.data.data),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const deleteUser = async (request, response) => {
  try {
    const { email } = request.query;
    const options = {
      method: "DELETE",
      url: `${config.USER_POOL_URL}/delete?email=${email}`,
      headers: { "Content-Type": "application/json" },
      validateStatus: function (status) {
        return (status >= 200 && status < 300) || status === 404;
      },
    };
    const user = await axios.request(options);
    if (user.status === 404) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    return sendResponse(
      onSuccess(200, messageResponse.USER_DELETED_SUCCESS),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const getNotJoinedUsers = async (request, response) => {
  try {
    const { location } = request.query;
    const { email } = request.body;
    const options = {
      method: "GET",
      url: `${config.USER_POOL_URL}/all/invite?location=${location}&email=${email}`,
      headers: { "Content-Type": "application/json" },
    };
    const users = await axios.request(options);
    return sendResponse(
      onSuccess(200, messageResponse.USER_FOUND, users.data.data),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const inviteUser = async (request, response) => {
  try {
    const { email } = request.body;
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = config.EMAIL_API_KEY;
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      email: config.SENDER_EMAIL,
      name: "55Feast",
    };
    sendSmtpEmail.subject = "Invitation to onboard 55Feast";
    sendSmtpEmail.replyTo = {
      email: config.SENDER_EMAIL,
      name: "55Feast",
    };
    const options = {
      method: "GET",
      url: `${config.USER_POOL_URL}?email=${email}`,
      headers: { "Content-Type": "application/json" },
      validateStatus: function (status) {
        return (status >= 200 && status < 300) || status === 404;
      },
    };
    const foundUser = await axios.request(options);
    if (foundUser.status === 404) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    sendSmtpEmail.to = [{ name: foundUser.data.data.fullName, email: email }];
    sendSmtpEmail.templateId = 3;
    const res = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return sendResponse(
      onSuccess(200, messageResponse.INVITED_SUCCESS),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const forgotPassword = async (request, response) => {
  try {
    const { email } = request.body;
    console.log(email, "kkkk")
    const user = await userModel.findOne({ email });
    if (!user)
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    let token = await tokenModel.findOne({ userId: user._id });
    if (!token) {
      token = await new tokenModel({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = config.EMAIL_API_KEY;
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      email: config.SENDER_EMAIL,
      name: "55Feast",
    };
    sendSmtpEmail.subject = "Reset password of 55Feast";
    sendSmtpEmail.replyTo = {
      email: config.SENDER_EMAIL,
      name: "55Feast",
    };
    sendSmtpEmail.to = [{ name: user.firstName, email: email }];
    sendSmtpEmail.templateId = 4;
    const link = `${config.RESET_PASSWORD_URL}/${user._id}/${token.token}`;
    sendSmtpEmail.params = {
      url: link,
    };
    const res = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return sendResponse(
      onSuccess(200, messageResponse.MAIL_SENT_SUCCESS),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const updatePassword = async (request, response) => {
  try {
    const user = await userModel.findById(request.params.userId);
    if (!user)
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    const token = await tokenModel.findOne({
      userId: user._id,
      token: request.params.token,
    });
    if (!token)
      return sendResponse(onError(400, messageResponse.LINK_EXPIRED), response);

      const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(request.body.newPassword, salt);
    const updatedUser = await userModel.findByIdAndUpdate(
      request.params.userId,
      { password: newHashedPassword },
      { new: true }
    );
    await tokenModel.findOneAndDelete({
      userId: user._id,
      token: request.params.token,
    });
    return sendResponse(
      onSuccess(200, messageResponse.PASSWORD_RESET_SUCCESS, updatedUser),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const checkPassword = async (request, response) => {
  try {
    const { email, oldPassword } = request.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    const validPassword = bcrypt.compareSync(oldPassword, user["password"]);
    if (validPassword) {
      return sendResponse(
        onSuccess(200, messageResponse.CORRECT_PASSWORD),
        response
      );
    }
    return sendResponse(
      onError(400, messageResponse.INVALID_PASSWORD),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const resetPassword = async (request, response) => {
  try {
    const { email, newPassword } = request.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);
    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      { password: newHashedPassword },
      { new: true }
    );
    return sendResponse(
      onSuccess(200, messageResponse.PASSWORD_UPDATED, updatedUser),
      response
    );
  } catch (error) {
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

export default {
  getAllUsers,
  getUser,
  getJoinedUsers,
  insertUser,
  updateUserPool,
  deleteUser,
  getNotJoinedUsers,
  inviteUser,
  forgotPassword,
  updatePassword,
  checkPassword,
  resetPassword
};
