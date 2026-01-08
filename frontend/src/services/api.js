// Adjust BASE_URL if needed (example if Flask runs on localhost:5000)
const BASE_URL = "http://localhost:5000";

export const fetchUsers = async () => {
  const response = await fetch(`${BASE_URL}/api/users`);
  const data = await response.json();
  return data;
};

export const addUser = async (user) => {
  const response = await fetch(`${BASE_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  return data;
};
