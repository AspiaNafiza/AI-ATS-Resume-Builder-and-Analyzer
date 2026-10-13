import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/analyzer/")({
  beforeLoad: () => {
    throw redirect({
      to: "/analyzer/$type",
      params: { type: "resume" },
    });
  },
});
