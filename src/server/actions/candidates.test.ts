import { describe, expect, it } from "vitest";
import { parsePublishCandidateForm } from "./candidates";

describe("parsePublishCandidateForm", () => {
  it("parses a valid publish candidate form", () => {
    const form = new FormData();
    form.set("candidateId", "2d7e5d38-3c6e-4a96-b59d-4ad26325fef7");
    form.set("title", "GPT-5 ships new coding features");
    form.set("summary", "OpenAI released a practical set of model updates for developers.");
    form.set("category", "models");
    form.set("tags", "OpenAI, GPT-5, developer tools");
    form.set("featured", "on");

    expect(parsePublishCandidateForm(form)).toEqual({
      candidateId: "2d7e5d38-3c6e-4a96-b59d-4ad26325fef7",
      title: "GPT-5 ships new coding features",
      summary: "OpenAI released a practical set of model updates for developers.",
      category: "models",
      tags: ["OpenAI", "GPT-5", "developer tools"],
      featured: true
    });
  });

  it("deduplicates tags by normalized slug", () => {
    const form = new FormData();
    form.set("candidateId", "2d7e5d38-3c6e-4a96-b59d-4ad26325fef7");
    form.set("title", "GPT-5 ships new coding features");
    form.set("summary", "OpenAI released a practical set of model updates for developers.");
    form.set("category", "models");
    form.set("tags", "OpenAI, openai, !!!, ???");

    expect(parsePublishCandidateForm(form).tags).toEqual(["OpenAI", "!!!"]);
  });
});
