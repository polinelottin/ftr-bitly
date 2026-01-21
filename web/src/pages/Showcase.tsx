import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

function Showcase() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-600">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-600 dark:text-white mb-8">
          Component Showcase
        </h1>

        {/* Buttons Section */}
        <div className="bg-white dark:bg-gray-600 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-600 dark:text-white mb-6">
            Buttons
          </h2>

          {/* Primary Buttons */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-white mb-4">
              Primary Variant
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary Button</Button>
              <Button variant="primary" icon="copy">Copy</Button>
              <Button variant="primary" icon="download-simple" iconPosition="right">
                Download
              </Button>
              <Button variant="primary" disabled>Disabled</Button>
              <Button variant="primary" icon="trash" ariaLabel="Delete" />
              <Button variant="primary" icon="link" ariaLabel="Link" />
              <Button variant="primary" icon="warning" ariaLabel="Warning" />
              <Button variant="primary" disabled icon="copy" ariaLabel="Disabled" />
            </div>
          </div>

          {/* Secondary Buttons */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-white mb-4">
              Secondary Variant
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="secondary" icon="copy">Copy</Button>
              <Button variant="secondary" icon="download-simple" iconPosition="right">
                Download
              </Button>
              <Button variant="secondary" disabled>Disabled</Button>
              <Button variant="secondary" icon="trash" ariaLabel="Delete" />
              <Button variant="secondary" icon="link" ariaLabel="Link" />
              <Button variant="secondary" icon="warning" ariaLabel="Warning" />
              <Button variant="secondary" disabled icon="copy" ariaLabel="Disabled" />
            </div>
          </div>

          {/* Icon Buttons Grid */}
          <div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-white mb-4">
              Icon Only Buttons
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" icon="copy" ariaLabel="Copy" />
              <Button variant="primary" icon="trash" ariaLabel="Delete" />
              <Button variant="primary" icon="link" ariaLabel="Link" />
              <Button variant="primary" icon="download-simple" ariaLabel="Download" />
              <Button variant="primary" icon="warning" ariaLabel="Warning" />
              <Button variant="secondary" icon="copy" ariaLabel="Copy" />
              <Button variant="secondary" icon="trash" ariaLabel="Delete" />
              <Button variant="secondary" icon="link" ariaLabel="Link" />
              <Button variant="secondary" icon="download-simple" ariaLabel="Download" />
              <Button variant="secondary" icon="warning" ariaLabel="Warning" />
            </div>
          </div>
        </div>

        {/* Inputs Section */}
        <div className="bg-white dark:bg-gray-600 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-600 dark:text-white mb-6">
            Inputs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Normal Input */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Normal Input
              </h3>
              <Input
                id="normal-input"
                label="URL"
                placeholder="https://example.com"
              />
            </div>

            {/* Required Input */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Required Input
              </h3>
              <Input
                id="required-input"
                label="URL"
                placeholder="https://example.com"
                required
              />
            </div>

            {/* Input with Error */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Input with Error
              </h3>
              <Input
                id="error-input"
                label="URL"
                placeholder="https://example.com"
                error="URL inválida. Por favor, insira uma URL válida."
                defaultValue="invalid-url"
              />
            </div>

            {/* Disabled Input */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Disabled Input
              </h3>
              <Input
                id="disabled-input"
                label="URL"
                placeholder="https://example.com"
                disabled
                defaultValue="https://example.com"
              />
            </div>

            {/* Input with Value */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Input with Value
              </h3>
              <Input
                id="value-input"
                label="URL"
                defaultValue="https://rocketseat.com.br"
              />
            </div>

            {/* Type Email Input */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Email Input
              </h3>
              <Input
                id="email-input"
                label="Email"
                type="email"
                placeholder="seu@email.com"
              />
            </div>
          </div>
        </div>

        {/* Form Example */}
        <div className="bg-white dark:bg-gray-600 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-600 dark:text-white mb-6">
            Form Example
          </h2>
          <form className="space-y-4 max-w-md">
            <Input
              id="form-url"
              label="URL Original"
              placeholder="https://example.com"
              required
            />
            <Input
              id="form-short-url"
              label="URL Curta (opcional)"
              placeholder="custom-link"
            />
            <div className="flex gap-3 pt-2">
              <Button variant="primary" type="submit" icon="link">
                Criar Link
              </Button>
              <Button variant="secondary" type="button">
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Showcase;
