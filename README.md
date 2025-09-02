# DynamoPrototype

A React-based prototype application for managing and evaluating AI systems.

## Features

### AI Systems Management
- View and manage AI systems across different projects
- Track system status, guardrails, and evaluation status
- Comprehensive statistics dashboard

### AI Providers Management
- **Secure API Key Storage**: Encrypted storage of OpenAI API keys using local encryption
- **Provider Validation**: Real-time validation of API keys against OpenAI's API
- **Provider Management**: Add, view, and delete AI service providers
- **Usage Tracking**: Monitor API usage and provider status
- **Secure Operations**: API keys are encrypted and never stored in plain text

### Evaluation Sandbox
- Test and evaluate AI models with different configurations
- Adjustable model parameters (temperature, max length, top P)
- Support for multiple AI models (GPT-4, Claude 3, Gemini Pro, etc.)
- Real-time configuration testing
- Save and share evaluation configurations

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   ├── app-bar.tsx        # Main navigation bar
│   ├── header-stats.tsx   # Statistics dashboard
│   ├── ai-systems-table.tsx # AI systems data table
│   ├── evaluation-sandbox.tsx # AI model evaluation interface
│   └── ai-providers.tsx   # AI providers management interface
├── data/
│   └── aiSystems.json     # Sample AI systems data
├── lib/
│   ├── utils.ts           # Utility functions
│   └── secure-storage.ts  # Secure storage utilities for API keys
└── types/
    └── index.ts           # TypeScript type definitions
```

## Technologies Used

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Vite** - Fast build tool and dev server
- **Radix UI** - Accessible UI primitives

## Navigation

The application features a tab-based navigation system:

- **AI Systems**: Main dashboard showing AI systems, statistics, and management tools
- **Evaluation Sandbox**: Interactive playground for testing AI model configurations
- **AI Providers**: Secure management of AI service providers and API keys

## AI Providers Features

The AI Providers tab provides comprehensive management of AI service providers:

### Security Features
- **Encrypted Storage**: API keys are encrypted using local encryption before storage
- **Secure Validation**: API keys are validated against OpenAI's API before storage
- **Masked Display**: API keys are displayed in masked format (sk-...abc123)
- **Local Storage**: All data is stored locally in the browser with encryption

### Provider Management
- **Add Providers**: Add new OpenAI providers with custom names
- **Validate Keys**: Real-time validation against OpenAI's API
- **View Providers**: See all providers with status, usage, and creation dates
- **Delete Providers**: Remove providers with confirmation dialogs
- **Usage Tracking**: Monitor API usage and last used timestamps

### API Key Validation
The system validates OpenAI API keys by:
1. Checking the key format (must start with "sk-")
2. Making a test request to OpenAI's `/v1/models` endpoint
3. Verifying the response status
4. Only storing valid, working API keys

## Evaluation Sandbox Features

The Evaluation Sandbox replicates the shadcn/ui playground structure and provides:

- **Model Selection**: Choose from various AI models
- **Parameter Tuning**: Adjust temperature, max length, and top P values
- **Mode Selection**: Complete, Insert, or Edit modes
- **Real-time Testing**: Submit prompts and see generated responses
- **Configuration Management**: Save and share evaluation setups

## Security Considerations

### API Key Storage
- **Encryption**: API keys are encrypted using local encryption before storage
- **Local Storage**: Keys are stored locally in the browser, not sent to external servers
- **Validation**: Keys are validated against the actual API before storage
- **Masking**: Keys are displayed in masked format for security

### Production Recommendations
- Use proper encryption libraries (AES-256) instead of the demo XOR encryption
- Implement secure key management systems
- Use environment variables for encryption keys
- Consider server-side storage for production applications
- Implement proper authentication and authorization

## Development

- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Preview**: `npm run preview`

## API Integration

The application integrates with OpenAI's API for:
- **Key Validation**: Testing API keys against `/v1/models` endpoint
- **Model Information**: Retrieving available models
- **Future Expansion**: Ready for chat completions and other OpenAI features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.