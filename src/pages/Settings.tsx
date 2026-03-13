import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function Settings() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    invoke<string | null>("get_llm_token")
      .then((value) => {
        if (value) {
          setToken(value);
        }
      })
      .catch((err) => {
        console.error("Failed to load LLM token:", err);
      });
  }, []);

  async function save() {
    try {
      await invoke("set_llm_token", { token });
      setStatus("Saved");
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      console.error("Failed to save LLM token:", err);
      setStatus("Error");
      setTimeout(() => setStatus(null), 2000);
    }
  }

  return (
    <div>
      <h1 className="text-xl my-4">Settings</h1>
      <label className="block mb-2 text-sm font-medium text-neutral-700">
        LLM API Token
      </label>
      <input
        type="password"
        className="bg-[#f4f5f6] w-full p-3 rounded-xl outline-none mb-3"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter your LLM API token"
      />
      <button onClick={save} className="button-primary">
        Save
      </button>
      {status && (
        <span className="ml-3 text-sm text-neutral-500">
          {status}
        </span>
      )}
    </div>
  );
}

export default Settings;

