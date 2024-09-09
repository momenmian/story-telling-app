"use client";

import { useState } from "react";

export default function HomePage() {
  const [characters, setCharacters] = useState<{ name: string; description: string; personality: string }[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [story, setStory] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [isLoading, setIsLoading] = useState(false); // Loading state for story generation

  const handleAddCharacter = () => {
    if (name && description && personality) {
      // Add character to state
      setCharacters([...characters, { name, description, personality }]);
      // Reset form fields
      setName("");
      setDescription("");
      setPersonality("");
    } else {
      alert("Please fill out all fields");
    }
  };

  const handleGenerateStory = async () => {
    setIsLoading(true); // Start loading
    setStory(""); // Clear previous story
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characters, model }),
      });

      const reader = response.body?.getReader();
      let text = "";

      if (reader) {
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          text += decoder.decode(value, { stream: true });
          setStory((prev) => prev + decoder.decode(value));
        }
      }
    } catch (error) {
      console.error("Error generating story:", error);
      setStory("Failed to generate story. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <h1>Create Your Story Characters</h1>

      <div>
        <input
          type="text"
          value={name}
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          value={description}
          placeholder="Description"
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          value={personality}
          placeholder="Personality"
          onChange={(e) => setPersonality(e.target.value)}
        />
        <button onClick={handleAddCharacter}>Add Character</button>
      </div>

      <h2>Character List</h2>
      {characters.length > 0 ? (
        <ul>
          {characters.map((char, index) => (
            <li key={index}>
              <strong>{char.name}</strong> - {char.description} - {char.personality}
            </li>
          ))}
        </ul>
      ) : (
        <p>No characters added yet.</p>
      )}

      <h2>Select Model</h2>
      <select value={model} onChange={(e) => setModel(e.target.value)}>
        <option value="gpt-4o-mini">GPT-4o Mini</option>
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        <option value="gpt-4">GPT-4</option>
      </select>

      <button onClick={handleGenerateStory} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Story"}
      </button>

      <h2>Generated Story</h2>
      <pre>{story}</pre>
    </div>
  );
}
