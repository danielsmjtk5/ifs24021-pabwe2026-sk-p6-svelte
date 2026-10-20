import { apiRequest } from "../../../helpers/apiHelper.js";

export function getUsers() {
  return apiRequest("/users");
}

export function getUserById(userId) {
  return apiRequest(`/users/${userId}`);
}

export function getProfile() {
  return apiRequest("/users/me");
}

export function putProfile(nameOrPayload, email) {
  const payload =
    typeof nameOrPayload === "object" && nameOrPayload !== null
      ? nameOrPayload
      : { name: nameOrPayload, email };

  return apiRequest("/users/me", { method: "PUT", body: payload });
}

export function postPhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  return apiRequest("/users/me/photo", { method: "POST", formData });
}

export function postProfilePhoto(file) {
  return postPhoto(file);
}

export function putPassword(passwordOrPayload, newPassword, confirmation) {
  const payload =
    typeof passwordOrPayload === "object" && passwordOrPayload !== null
      ? passwordOrPayload
      : {
          password: passwordOrPayload,
          newPassword,
          confirmation,
        };

  return apiRequest("/users/password", {
    method: "PUT",
    body: {
      password: payload.password,
      new_password: payload.newPassword ?? payload.new_password,
      new_password_confirmation: payload.confirmation ?? payload.new_password_confirmation,
    },
  });
}

export function putProfilePassword(passwordOrPayload, newPassword, confirmation) {
  return putPassword(passwordOrPayload, newPassword, confirmation);
}

const userApi = {
  getUsers,
  getUserById,
  getProfile,
  putProfile,
  postPhoto,
  postProfilePhoto,
  putPassword,
  putProfilePassword,
};

export default userApi;
