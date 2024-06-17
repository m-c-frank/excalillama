import { useState } from 'react';

const LLM_MODEL = "orca-mini"

const generate_streaming = async ({ model, prompt, newResponseCallback }) => {
    const reader = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
      }),
    }).then((response) => response.body.getReader());

    const decoder = new TextDecoder();

    const readStream = () => {
      reader.read().then(({ done, value }) => {
        if (done) {
          console.log('Stream finished.');
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        try {
          const jsonChunk = JSON.parse(chunk);
          newResponseCallback(jsonChunk.response);
        } catch (error) {
          console.error('Error parsing JSON chunk', error);
        }
        // Read the next chunk
        readStream();
      }).catch((error) => {
        console.error('Error reading stream', error);
      });
    };
    readStream();
}

export { generate_streaming };

export default function GenerateStreamingText() {
  const [inputText, setInputText] = useState('');
  const [responses, setResponses] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponses('');

    generate_streaming({
      model: LLM_MODEL,
      prompt: inputText,
      newResponseCallback: (response) => {
        setResponses((prevResponses) => prevResponses + response + '');
      },
    });
  };

  return (
    <div className="generateContainer">
      <form onSubmit={handleSubmit} className="generateForm">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter prompt"
        />
        <button type="submit">Submit</button>
      </form>
      <div className="responseContainer">
        <p>Responses:</p>
        <p>{responses}</p>
      </div>
    </div>
  );
}
