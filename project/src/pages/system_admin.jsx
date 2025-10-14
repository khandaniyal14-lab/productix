import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Users, Building, ToggleLeft, ToggleRight, Trash2, Plus } from "lucide-react";

const SystemAdmin = () => {
  const [orgs, setOrgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newOrg, setNewOrg] = useState({ name: "", subscription_plan: "free" });
  const [newUser, setNewUser] = useState({ email: "", password: "", org_id: "", role: "org_admin" });

  // Load orgs + users
  const fetchData = async () => {
    setLoading(true);
    try {
      const [orgRes, userRes] = await Promise.all([
        api.get("/system-admin/organizations"),
        api.get("/system-admin/users"),
      ]);

      // Ensure subscription info is available for each org
      const orgsWithStatus = orgRes.data.map((org) => ({
        ...org,
        subscription: { status: org.status  },
      }));

      setOrgs(orgsWithStatus);
      setUsers(userRes.data);
    } catch (err) {
      console.error("Error loading system admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    // Redirect to login page
    window.location.href = "/login";
  };
  // ----------------------------
  // Organizations
  // ----------------------------
  const createOrganization = async (e) => {
    e.preventDefault();
    try {
      await api.post("/system-admin/organizations", newOrg);
      setNewOrg({ name: "", subscription_plan: "free" });
      fetchData();
    } catch (err) {
      console.error("Error creating organization:", err);
    }
  };

  const toggleSubscription = async (orgId, enable) => {
    try {
      const url = enable
        ? `/system-admin/organizations/${orgId}/subscription/enable`
        : `/system-admin/organizations/${orgId}/subscription/cancel`;

      const res = await api.post(url);

      // Update subscription status in state
      setOrgs((prevOrgs) =>
        prevOrgs.map((org) =>
          org.id === orgId
            ? { ...org, subscription: res.data.subscription }
            : org
        )
      );
    } catch (err) {
      console.error("Error updating subscription:", err);
    }
  };

  const deleteOrg = async (orgId) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;
    try {
      await api.delete(`/system-admin/organizations/${orgId}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting org:", err);
    }
  };

  // ----------------------------
  // Users
  // ----------------------------
  const createUser = async (e) => {
    e.preventDefault();
    if (!newUser.org_id) {
      alert("Organization ID is required");
      return;
    }

    try {
      await api.post(`/system-admin/organizations/${newUser.org_id}/users`, {
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      });
      setNewUser({ email: "", password: "", org_id: "", role: "org_admin" });
      fetchData();
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/system-admin/users/${userId}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p className="text-white text-center mt-10">Loading System Admin Dashboard...</p>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">System Admin Dashboard</h1>
      <button onClick={logout} className="mb-6 px-4 py-2 bg-red-600 rounded">
        Logout
      </button>

      {/* ---------------------- */}
      {/* Create Organization */}
      {/* ---------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Building className="w-5 h-5" /> Create Organization
        </h2>
        <form onSubmit={createOrganization} className="flex gap-4 bg-slate-900 p-4 rounded-lg mb-6">
          <input
            type="text"
            placeholder="Organization Name"
            value={newOrg.name}
            onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
            className="px-3 py-2 rounded bg-slate-800 flex-1"
            required
          />
          <select
            value={newOrg.subscription_plan}
            onChange={(e) => setNewOrg({ ...newOrg, subscription_plan: e.target.value })}
            className="px-3 py-2 rounded bg-slate-800"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-green-600 rounded flex items-center gap-2">
            <Plus size={16} /> Create
          </button>
        </form>

        {/* Orgs Table */}
        <div className="bg-slate-900 rounded-xl p-4 border border-white/10">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-2">ID</th>
                <th>Name</th>
                <th>Plan</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-white/5">
                  <td className="py-2">{org.id}</td>
                  <td>{org.name}</td>
                  <td>{org.subscription_plan || "N/A"}</td>
                  <td>{org.subscription?.status === "active" ? "Active" : "Disabled"}</td>
                  <td className="text-right flex gap-2 justify-end">
                    {org.subscription?.status === "active" ? (
                      <button
                        onClick={() => toggleSubscription(org.id, false)}
                        className="px-3 py-1 bg-red-600 rounded flex items-center gap-1"
                      >
                        <ToggleLeft size={16} /> Disable
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleSubscription(org.id, true)}
                        className="px-3 py-1 bg-green-600 rounded flex items-center gap-1"
                      >
                        <ToggleRight size={16} /> Enable
                      </button>
                    )}
                    <button
                      onClick={() => deleteOrg(org.id)}
                      className="px-3 py-1 bg-gray-700 rounded flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------- */}
      {/* Create User */}
      {/* ---------------------- */}
      <section>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" /> Create Org Admin / User
        </h2>
        <form onSubmit={createUser} className="flex gap-4 bg-slate-900 p-4 rounded-lg mb-6">
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="px-3 py-2 rounded bg-slate-800 flex-1"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="px-3 py-2 rounded bg-slate-800 flex-1"
            required
          />
          <input
            type="number"
            placeholder="Org ID"
            value={newUser.org_id}
            onChange={(e) => setNewUser({ ...newUser, org_id: e.target.value })}
            className="px-3 py-2 rounded bg-slate-800 w-24"
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="px-3 py-2 rounded bg-slate-800"
          >
            <option value="org_admin">Org Admin</option>
            <option value="org_user">Org User</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-blue-600 rounded flex items-center gap-2">
            <Plus size={16} /> Create
          </button>
        </form>

        {/* Users Table */}
        <div className="bg-slate-900 rounded-xl p-4 border border-white/10">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-2">ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Org ID</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5">
                  <td className="py-2">{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.organization_id}</td>
                  <td className="text-right">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="px-3 py-1 bg-red-600 rounded flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SystemAdmin;
