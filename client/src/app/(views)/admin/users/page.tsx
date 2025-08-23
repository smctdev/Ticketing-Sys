"use client";

import withAuthPage from "@/lib/hoc/with-auth-page";

function Users() {
  return <div>users</div>;
}

export default withAuthPage(Users, true);
