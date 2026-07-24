"use client";

import { useEffect, useState } from "react";

interface Challenge {
  token: string;
  kind: "image" | "math";
  image?: string;
  question?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeError, setChallengeError] = useState(false);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const loadChallenge = async (kind: "image" | "math" = "image") => {
    setChallengeError(false);
    try {
      const res = await fetch(`/api/captcha?kind=${kind}`, { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      setChallenge(await res.json());
      setAnswer("");
    } catch {
      setChallengeError(true);
    }
  };

  useEffect(() => {
    loadChallenge();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          company: data.get("company"), // honeypot
          captchaToken: challenge?.token,
          captchaAnswer: answer,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(json.error || "Something went wrong. Please try again.");
        if (json.captchaFailed) loadChallenge(challenge?.kind);
        return;
      }

      setStatus("success");
      form.reset();
      setAnswer("");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="contact-form-card contact-form-success" role="status">
        <p className="eyebrow">Message sent</p>
        <h3>Thanks for reaching out.</h3>
        <p>We received your message and will be in touch soon.</p>
        <button type="button" className="btn btn-ghost" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label className="form-field">
          <span>Name</span>
          <input type="text" name="name" autoComplete="name" required maxLength={120} />
        </label>
        <label className="form-field">
          <span>Email</span>
          <input type="email" name="email" autoComplete="email" required maxLength={200} />
        </label>
      </div>

      <label className="form-field">
        <span>Message</span>
        <textarea name="message" rows={5} required maxLength={5000} />
      </label>

      {/* Honeypot — hidden from sighted/keyboard users, bots tend to fill every field. */}
      <div className="form-honeypot" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="captcha-box">
        {challenge?.kind === "image" && challenge.image && (
          <img src={challenge.image} alt="CAPTCHA — enter the characters shown" width={180} height={64} />
        )}
        {challenge?.kind === "math" && <div className="captcha-math">{challenge.question} =</div>}
        {!challenge && !challengeError && <div className="captcha-loading">Loading…</div>}
        {challengeError && <div className="captcha-loading">Couldn't load a challenge.</div>}

        <label className="form-field captcha-answer">
          <span>{challenge?.kind === "math" ? "Your answer" : "Enter the characters above"}</span>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            autoComplete="off"
            required
            maxLength={10}
          />
        </label>

        <div className="captcha-actions">
          <button type="button" className="captcha-link" onClick={() => loadChallenge(challenge?.kind)}>
            New challenge
          </button>
          <button
            type="button"
            className="captcha-link"
            onClick={() => loadChallenge(challenge?.kind === "math" ? "image" : "math")}
          >
            {challenge?.kind === "math" ? "Use image instead" : "Trouble viewing? Use a math question"}
          </button>
        </div>
      </div>

      {status === "error" && (
        <p className="form-error" role="alert">
          {errorMsg}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-lg" disabled={status === "submitting" || !challenge}>
        {status === "submitting" ? "Sending…" : "Send message"} <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
