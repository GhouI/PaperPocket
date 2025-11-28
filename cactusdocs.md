# Cactus React Native

Cactus React Native is a library that enables running AI language models and speech-to-text models locally on mobile devices. Built on React Native Nitro Modules, it provides a TypeScript API for on-device inference without requiring cloud connectivity. The library supports multiple model types including text generation models, vision models, and Whisper-based speech recognition models.

The library offers both class-based and React Hook APIs for managing model lifecycle, downloads, and inference. It includes features like streaming token generation, function calling (tool use), RAG (Retrieval Augmented Generation), embeddings generation for text/images/audio, and hybrid mode with cloud fallback. All models run entirely on-device after initial download, providing privacy and offline capability for mobile applications.

## Language Model Text Completion

Generate text completions with streaming support and conversation history.

```typescript
import { CactusLM, type Message } from 'cactus-react-native';

const cactusLM = new CactusLM();

// Download model first
await cactusLM.download({
  onProgress: (progress) => console.log(`Download: ${Math.round(progress * 100)}%`)
});

// Initialize for inference
await cactusLM.init();

// Generate completion with streaming
const messages: Message[] = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is the capital of France?' }
];

const result = await cactusLM.complete({
  messages,
  options: {
    temperature: 0.7,
    maxTokens: 256,
    topP: 0.9,
    topK: 40
  },
  onToken: (token) => console.log(token)
});

console.log(result.response);
// Output: "The capital of France is Paris."
console.log(`Tokens/sec: ${result.tokensPerSecond}`);
console.log(`Total time: ${result.totalTimeMs}ms`);

// Clean up
await cactusLM.destroy();
```

## React Hook for Language Model

Manage language model lifecycle with reactive state in React components.

```typescript
import { useCactusLM } from 'cactus-react-native';
import { useEffect } from 'react';
import { View, Text, Button } from 'react-native';

function ChatComponent() {
  const cactusLM = useCactusLM({
    model: 'qwen3-0.6',
    contextSize: 2048
  });

  useEffect(() => {
    if (!cactusLM.isDownloaded) {
      cactusLM.download();
    }
  }, [cactusLM.isDownloaded]);

  const handleSendMessage = async () => {
    if (!cactusLM.isDownloaded || cactusLM.isGenerating) return;

    await cactusLM.complete({
      messages: [
        { role: 'user', content: 'Tell me a short joke' }
      ],
      options: { maxTokens: 128 }
    });
  };

  if (cactusLM.isDownloading) {
    return (
      <View>
        <Text>Downloading model: {Math.round(cactusLM.downloadProgress * 100)}%</Text>
      </View>
    );
  }

  if (cactusLM.error) {
    return <Text>Error: {cactusLM.error}</Text>;
  }

  return (
    <View>
      <Button
        title="Generate"
        onPress={handleSendMessage}
        disabled={cactusLM.isGenerating}
      />
      {cactusLM.isGenerating && <Text>Generating...</Text>}
      <Text>{cactusLM.completion}</Text>
    </View>
  );
}
```

## Vision Model Image Analysis

Analyze images with vision-capable models by passing images in messages.

```typescript
import { CactusLM, type Message } from 'cactus-react-native';

// Use vision-capable model
const cactusLM = new CactusLM({
  model: 'lfm2-vl-450m'
});

await cactusLM.download({
  onProgress: (progress) => console.log(`${Math.round(progress * 100)}%`)
});

await cactusLM.init();

// Analyze image with text prompt
const messages: Message[] = [
  {
    role: 'user',
    content: 'Describe what you see in this image in detail.',
    images: ['file:///path/to/image.jpg']
  }
];

const result = await cactusLM.complete({
  messages,
  options: { maxTokens: 512 }
});

console.log(result.response);
// Output: "The image shows a golden retriever playing in a park..."

await cactusLM.destroy();
```

## Function Calling (Tool Use)

Enable models to generate structured function calls with parameters.

```typescript
import { CactusLM, type Message, type Tool } from 'cactus-react-native';

const tools: Tool[] = [
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name'
        },
        units: {
          type: 'string',
          description: 'Temperature units (celsius or fahrenheit)'
        }
      },
      required: ['location']
    }
  },
  {
    name: 'search_web',
    description: 'Search the web for information',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        }
      },
      required: ['query']
    }
  }
];

const cactusLM = new CactusLM();
await cactusLM.download();
await cactusLM.init();

const messages: Message[] = [
  { role: 'user', content: "What's the weather like in Tokyo?" }
];

const result = await cactusLM.complete({
  messages,
  tools
});

console.log(result.functionCalls);
// Output: [
//   {
//     name: 'get_weather',
//     arguments: { location: 'Tokyo', units: 'celsius' }
//   }
// ]

await cactusLM.destroy();
```

## RAG (Retrieval Augmented Generation)

Query documents by providing a corpus directory containing text files.

```typescript
import { CactusLM, type Message } from 'cactus-react-native';
import { CactusFileSystem } from 'cactus-react-native';

// Create corpus directory with text files
const corpusPath = await CactusFileSystem.getDocumentsDirectory() + '/corpus';
// Place .txt files in corpus directory before initialization

const cactusLM = new CactusLM({
  model: 'qwen3-0.6',
  corpusDir: corpusPath
});

await cactusLM.download();
await cactusLM.init();

// Query the corpus
const messages: Message[] = [
  {
    role: 'user',
    content: 'Based on the provided documents, what is the main product feature?'
  }
];

const result = await cactusLM.complete({
  messages,
  options: { maxTokens: 256 }
});

console.log(result.response);
// Output: "According to the documents, the main product feature is..."

await cactusLM.destroy();
```

## Text Embeddings Generation

Convert text into numerical vector representations for semantic search.

```typescript
import { CactusLM } from 'cactus-react-native';

const cactusLM = new CactusLM();
await cactusLM.download();
await cactusLM.init();

// Generate embedding for single text
const result = await cactusLM.embed({
  text: 'Machine learning on mobile devices'
});

console.log(`Embedding dimension: ${result.embedding.length}`);
// Output: Embedding dimension: 2048

// Use embeddings for similarity search
const texts = [
  'The quick brown fox',
  'AI on smartphones',
  'Mobile machine learning'
];

const embeddings = await Promise.all(
  texts.map(text => cactusLM.embed({ text }))
);

// Calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
}

const query = await cactusLM.embed({ text: 'ML on phones' });
texts.forEach((text, i) => {
  const similarity = cosineSimilarity(query.embedding, embeddings[i].embedding);
  console.log(`"${text}": ${similarity.toFixed(3)}`);
});

await cactusLM.destroy();
```

## Image Embeddings Generation

Generate vector embeddings from images for image similarity and search.

```typescript
import { CactusLM } from 'cactus-react-native';

const cactusLM = new CactusLM({
  model: 'lfm2-vl-450m'  // Vision-capable model required
});

await cactusLM.download({
  onProgress: (p) => console.log(`${Math.round(p * 100)}%`)
});

await cactusLM.init();

// Generate embedding for image
const result = await cactusLM.imageEmbed({
  imagePath: 'file:///storage/emulated/0/pictures/photo.jpg'
});

console.log(`Image embedding dimension: ${result.embedding.length}`);
// Output: Image embedding dimension: 2048

// Compare multiple images
const imagePaths = [
  'file:///path/to/cat1.jpg',
  'file:///path/to/cat2.jpg',
  'file:///path/to/dog.jpg'
];

const imageEmbeddings = await Promise.all(
  imagePaths.map(path => cactusLM.imageEmbed({ imagePath: path }))
);

// Find most similar image
const queryImage = await cactusLM.imageEmbed({
  imagePath: 'file:///path/to/query_cat.jpg'
});

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
}

imagePaths.forEach((path, i) => {
  const sim = cosineSimilarity(queryImage.embedding, imageEmbeddings[i].embedding);
  console.log(`${path}: ${sim.toFixed(3)}`);
});

await cactusLM.destroy();
```

## Hybrid Mode with Cloud Fallback

Automatically fallback to cloud inference when local inference fails.

```typescript
import { CactusLM, CactusConfig, type Message } from 'cactus-react-native';

// Configure cloud token for hybrid mode
CactusConfig.cactusToken = 'your-cactus-token-here';

const cactusLM = new CactusLM();
await cactusLM.download();

const messages: Message[] = [
  { role: 'user', content: 'Write a haiku about programming' }
];

try {
  // Try local inference, fallback to cloud if fails
  const result = await cactusLM.complete({
    messages,
    mode: 'hybrid',  // 'local' | 'hybrid'
    options: { maxTokens: 128 }
  });

  console.log(result.response);
  // Output: "Code flows like water\nBugs hide in logic's shadow\nDebug brings the light"
} catch (error) {
  console.error('Both local and remote inference failed:', error);
}

await cactusLM.destroy();
```

## Speech-to-Text Transcription

Transcribe audio files to text with Whisper models.

```typescript
import { CactusSTT } from 'cactus-react-native';

const cactusSTT = new CactusSTT({
  model: 'whisper-small'
});

await cactusSTT.download({
  onProgress: (progress) => console.log(`${Math.round(progress * 100)}%`)
});

await cactusSTT.init();

// Transcribe audio file with streaming
const result = await cactusSTT.transcribe({
  audioFilePath: 'file:///path/to/audio.wav',
  prompt: '<|startoftranscript|><|en|><|transcribe|><|notimestamps|>',
  options: {
    maxTokens: 512,
    temperature: 0.0
  },
  onToken: (token) => console.log('Token:', token)
});

console.log('Transcription:', result.response);
// Output: "This is a test recording for speech recognition."

console.log(`Time to first token: ${result.timeToFirstTokenMs}ms`);
console.log(`Total time: ${result.totalTimeMs}ms`);
console.log(`Speed: ${result.tokensPerSecond} tokens/sec`);

await cactusSTT.destroy();
```

## Speech-to-Text React Hook

Manage speech recognition with reactive state in components.

```typescript
import { useCactusSTT } from 'cactus-react-native';
import { useEffect } from 'react';
import { View, Text, Button } from 'react-native';

function TranscriptionComponent() {
  const cactusSTT = useCactusSTT({
    model: 'whisper-small',
    contextSize: 2048
  });

  useEffect(() => {
    if (!cactusSTT.isDownloaded) {
      cactusSTT.download();
    }
  }, [cactusSTT.isDownloaded]);

  const handleTranscribe = async () => {
    try {
      await cactusSTT.transcribe({
        audioFilePath: 'file:///recordings/audio_001.wav',
        options: { maxTokens: 512 }
      });
    } catch (error) {
      console.error('Transcription failed:', error);
    }
  };

  if (cactusSTT.isDownloading) {
    return (
      <Text>
        Downloading: {Math.round(cactusSTT.downloadProgress * 100)}%
      </Text>
    );
  }

  return (
    <View>
      <Button
        title="Transcribe Audio"
        onPress={handleTranscribe}
        disabled={cactusSTT.isGenerating || !cactusSTT.isDownloaded}
      />
      {cactusSTT.isGenerating && <Text>Transcribing...</Text>}
      <Text>Result: {cactusSTT.transcription}</Text>
      {cactusSTT.error && <Text>Error: {cactusSTT.error}</Text>}
    </View>
  );
}
```

## Audio Embeddings Generation

Generate embeddings from audio files for audio similarity search.

```typescript
import { CactusSTT } from 'cactus-react-native';

const cactusSTT = new CactusSTT();
await cactusSTT.download();
await cactusSTT.init();

// Generate audio embedding
const result = await cactusSTT.audioEmbed({
  audioPath: 'file:///path/to/recording.wav'
});

console.log(`Audio embedding dimension: ${result.embedding.length}`);
// Output: Audio embedding dimension: 4096

// Compare multiple audio files
const audioPaths = [
  'file:///recordings/speaker1_hello.wav',
  'file:///recordings/speaker2_hello.wav',
  'file:///recordings/speaker1_goodbye.wav'
];

const audioEmbeddings = await Promise.all(
  audioPaths.map(path => cactusSTT.audioEmbed({ audioPath: path }))
);

const queryAudio = await cactusSTT.audioEmbed({
  audioPath: 'file:///recordings/speaker1_test.wav'
});

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
}

// Find matching speaker
audioPaths.forEach((path, i) => {
  const similarity = cosineSimilarity(queryAudio.embedding, audioEmbeddings[i].embedding);
  console.log(`${path}: ${similarity.toFixed(3)}`);
});
// Output shows speaker1_hello.wav has highest similarity

await cactusSTT.destroy();
```

## Model Management and Discovery

List available models and check download status.

```typescript
import { CactusLM, type CactusModel } from 'cactus-react-native';

const cactusLM = new CactusLM();

// Fetch all available models
const models: CactusModel[] = await cactusLM.getModels();

console.log('Available models:');
models.forEach(model => {
  console.log(`
Name: ${model.name}
Slug: ${model.slug}
Size: ${model.sizeMb} MB
Quantization: ${model.quantization}-bit
Tool Calling: ${model.supportsToolCalling}
Vision: ${model.supportsVision}
Downloaded: ${model.isDownloaded}
Download URL: ${model.downloadUrl}
  `);
});

// Filter for downloaded vision models
const downloadedVisionModels = models.filter(
  m => m.isDownloaded && m.supportsVision
);

console.log('Downloaded vision models:', downloadedVisionModels.length);

// Find smallest model that supports tool calling
const toolModels = models
  .filter(m => m.supportsToolCalling)
  .sort((a, b) => a.sizeMb - b.sizeMb);

if (toolModels.length > 0) {
  console.log(`Smallest tool-calling model: ${toolModels[0].slug} (${toolModels[0].sizeMb} MB)`);
}
```

## Configuration and Telemetry

Configure telemetry tracking and hybrid mode settings.

```typescript
import { CactusConfig, CactusLM } from 'cactus-react-native';

// Configure telemetry
CactusConfig.telemetryToken = 'your-telemetry-token';
CactusConfig.isTelemetryEnabled = true;

// Configure hybrid mode
CactusConfig.cactusToken = 'your-cactus-api-token';

// Create instance - telemetry is automatically initialized
const cactusLM = new CactusLM({
  model: 'qwen3-0.6',
  contextSize: 4096
});

await cactusLM.download();

// All operations are automatically logged to telemetry
await cactusLM.init();

const result = await cactusLM.complete({
  messages: [{ role: 'user', content: 'Hello' }]
});

// Disable telemetry at runtime
CactusConfig.isTelemetryEnabled = false;

// Further operations won't be logged
const result2 = await cactusLM.complete({
  messages: [{ role: 'user', content: 'Goodbye' }]
});

await cactusLM.destroy();
```

## Multi-Turn Conversation Management

Handle conversation history with context management and reset.

```typescript
import { CactusLM, type Message } from 'cactus-react-native';

const cactusLM = new CactusLM({
  contextSize: 4096  // Larger context for longer conversations
});

await cactusLM.download();
await cactusLM.init();

// Maintain conversation history
const conversation: Message[] = [
  { role: 'system', content: 'You are a helpful math tutor.' }
];

// First turn
conversation.push({
  role: 'user',
  content: 'What is 15 multiplied by 24?'
});

let result = await cactusLM.complete({
  messages: conversation,
  options: { maxTokens: 128 }
});

conversation.push({
  role: 'assistant',
  content: result.response
});
console.log('Assistant:', result.response);

// Second turn - model remembers context
conversation.push({
  role: 'user',
  content: 'Now divide that result by 3'
});

result = await cactusLM.complete({
  messages: conversation,
  options: { maxTokens: 128 }
});

conversation.push({
  role: 'assistant',
  content: result.response
});
console.log('Assistant:', result.response);

// Reset context when starting new topic
await cactusLM.reset();
conversation.length = 1; // Keep system message only

conversation.push({
  role: 'user',
  content: 'What is the capital of Japan?'
});

result = await cactusLM.complete({
  messages: conversation,
  options: { maxTokens: 128 }
});

console.log('Assistant:', result.response);

await cactusLM.destroy();
```

## Stop and Control Generation

Control ongoing generation with stop, reset, and lifecycle management.

```typescript
import { CactusLM } from 'cactus-react-native';

const cactusLM = new CactusLM();
await cactusLM.download();
await cactusLM.init();

// Start long-running generation
const generationPromise = cactusLM.complete({
  messages: [{
    role: 'user',
    content: 'Write a very long story about space exploration'
  }],
  options: { maxTokens: 2048 },
  onToken: (token) => console.log(token)
});

// Stop generation after 2 seconds
setTimeout(async () => {
  console.log('Stopping generation...');
  await cactusLM.stop();
}, 2000);

try {
  const result = await generationPromise;
  console.log('Generation completed naturally');
} catch (error) {
  console.log('Generation was stopped:', error);
}

// Reset clears cached context
await cactusLM.reset();

// New generation starts fresh
const newResult = await cactusLM.complete({
  messages: [{ role: 'user', content: 'Hello' }]
});

console.log(newResult.response);

// Destroy releases all resources
await cactusLM.destroy();

// Can't use after destroy - would need new instance
// await cactusLM.complete(...); // This would throw an error
```

## Summary

Cactus React Native enables sophisticated on-device AI capabilities for mobile applications through its dual-mode API design. The primary use cases include building privacy-focused chat applications, offline voice transcription apps, semantic search over user documents, image analysis without cloud dependencies, and AI-powered features in apps with limited connectivity. The library handles the complexity of model lifecycle management, provides progress tracking for long-running operations, and offers graceful degradation through hybrid mode when device resources are insufficient.

Integration patterns center around either the class-based API for direct control and non-React contexts, or the React Hook API for seamless state management in React Native components. The library integrates with the native filesystem for model storage, supports telemetry for monitoring production usage, and provides comprehensive TypeScript types for type-safe development. Performance considerations include choosing appropriate model sizes for target devices, managing context windows to balance capability and memory usage, and properly cleaning up resources with destroy() methods to prevent memory leaks in long-running applications.
