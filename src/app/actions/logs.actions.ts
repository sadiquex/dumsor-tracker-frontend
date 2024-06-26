"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

async function createLog(payload: any) {
  const supabase = await createClient();

  const {
    data: { session: supabaseSession },
  } = await supabase.auth.getSession();

  const url = new URL(`${BASE_URL}/logs`);
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${supabaseSession?.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(msg);
  }

  revalidatePath("/");

  return response.json();
}

// Get One Log
async function getLog(id: string) {
  const url = new URL(`${BASE_URL}/logs/${id}`);
  const response = await fetch(url, {
    method: "GET",
  });
  if (!response.ok) {
    redirect("/");
  }

  return response.json();
}

// Update Logs
async function updateLogs(payload: any) {
  const supabase = await createClient();

  const {
    data: { session: supabaseSession },
  } = await supabase.auth.getSession();

  const url = new URL(`${BASE_URL}/logs/${payload.id}`);
  const response = await fetch(url, {
    method: "PATCH",
    body: JSON.stringify(payload.values),
    headers: {
      Authorization: `Bearer ${supabaseSession?.access_token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const msg = await response.text();
    throw new Error(msg);
  }

  revalidatePath("/");

  return response.json();
}

type searchQuery = {
  location?: string;
  page?: string;
};

async function getLogs({ ...params }: searchQuery) {
  let url;
  params.location && params.page
    ? (url = new URL(
        `${BASE_URL}/logs?page=${params.page}&location=${params.location}`,
      ))
    : (url = new URL(`${BASE_URL}/logs?page=${params.page}`));
  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(msg);
  }

  return response.json();
}

async function getRecentLogs() {
  const response = await getLogs({ page: "1", location: "" });

  if (!response || !response.data || !Array.isArray(response.data.logs)) {
    throw new Error("An error occurred while fetching recent logs");
  }

  const logs = response.data.logs;

  return logs;
}

export { createLog, getLogs, getLog, getRecentLogs, updateLogs };
