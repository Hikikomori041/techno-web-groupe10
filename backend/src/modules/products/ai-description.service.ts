import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiDescriptionService {
  constructor(private configService: ConfigService) {}

  /**
   * Generate a product description using AI
   * Supports OpenAI, DeepSeek, or fallback to template-based generation
   */
  async generateDescription(productData: {
    nom: string;
    prix: number;
    specifications?: Array<{ key: string; value: string }>;
    categoryName?: string;
  }): Promise<string> {
    const apiKey = this.configService.get<string>('AI_API_KEY');
    const aiProvider = this.configService.get<string>('AI_PROVIDER') || 'template';

    // If API key is configured, try AI generation
    if (apiKey && (aiProvider === 'openai' || aiProvider === 'deepseek')) {
      try {
        return await this.generateWithAI(productData, aiProvider, apiKey);
      } catch (error) {
        console.error('AI generation failed, falling back to template:', error);
        // Fallback to template if AI fails
      }
    }

    // Fallback: Template-based generation
    return this.generateTemplateDescription(productData);
  }

  /**
   * Generate description using AI API (OpenAI or DeepSeek compatible)
   */
  private async generateWithAI(
    productData: {
      nom: string;
      prix: number;
      specifications?: Array<{ key: string; value: string }>;
      categoryName?: string;
    },
    provider: string,
    apiKey: string,
  ): Promise<string> {
    const { nom, prix, specifications, categoryName } = productData;

    // Build prompt
    const specsText = specifications?.map(s => `${s.key}: ${s.value}`).join(', ') || 'Aucune';
    
    const prompt = `Générez une description marketing professionnelle et attractive en français pour ce produit e-commerce:

Nom: ${nom}
Catégorie: ${categoryName || 'Produit technologique'}
Prix: $${prix.toFixed(2)}
Spécifications: ${specsText}

La description doit:
- Faire 100-150 mots
- Être convaincante et professionnelle
- Mettre en avant les avantages du produit
- Inclure un appel à l'action
- Utiliser un ton moderne et engageant

Description:`;

    // API endpoint (DeepSeek uses OpenAI-compatible API)
    const apiUrl = provider === 'deepseek' 
      ? 'https://api.deepseek.com/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: provider === 'deepseek' ? 'deepseek-chat' : 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en rédaction de descriptions de produits e-commerce. Tes descriptions sont convaincantes, professionnelles et optimisées pour la vente.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  /**
   * Template-based description generation (fallback)
   */
  private generateTemplateDescription(productData: {
    nom: string;
    prix: number;
    specifications?: Array<{ key: string; value: string }>;
    categoryName?: string;
  }): Promise<string> {
    const { nom, prix, specifications, categoryName } = productData;

    let description = `**${nom}** est un produit d'exception qui combine innovation et qualité`;
    
    if (categoryName) {
      description += ` dans le domaine des ${categoryName.toLowerCase()}`;
    }
    
    description += `. `;

    // Add specifications-based details
    if (specifications && specifications.length > 0) {
      description += '\n\n**Caractéristiques techniques :**\n';
      specifications.forEach(spec => {
        description += `- **${spec.key}** : ${spec.value}\n`;
      });
      description += '\n';
    }

    // Add value proposition based on price
    if (prix > 1500) {
      description += `Ce produit premium à **$${prix.toFixed(2)}** est conçu pour les professionnels exigeants qui recherchent l'excellence et des performances sans compromis. `;
    } else if (prix > 800) {
      description += `Proposé à **$${prix.toFixed(2)}**, ce produit offre un rapport qualité-prix exceptionnel, idéal pour ceux qui recherchent la performance sans exploser leur budget. `;
    } else {
      description += `Avec son prix attractif de **$${prix.toFixed(2)}**, c'est le choix parfait pour tous ceux qui veulent de la qualité à un prix accessible. `;
    }

    // Add benefits and call to action
    description += '\n\n**Avantages :**\n';
    description += '✓ Garantie fabricant de 1 an\n';
    description += '✓ Livraison gratuite sur commandes de plus de $500\n';
    description += '✓ Retours acceptés sous 30 jours\n';
    description += '✓ Support technique disponible\n\n';
    description += '**Commandez dès maintenant** et profitez de notre service client exceptionnel et de notre expertise reconnue dans le secteur !';

    return Promise.resolve(description);
  }

  /**
   * Generate description using OpenAI API (requires API key)
   * Uncomment and configure when API key is available
   */
  /*
  async generateWithOpenAI(productData: {
    nom: string;
    prix: number;
    specifications?: Array<{ key: string; value: string }>;
    categoryName?: string;
  }): Promise<string> {
    const { nom, specifications, categoryName } = productData;
    
    const prompt = `Générez une description marketing professionnelle et attractive pour le produit suivant:
    
    Nom: ${nom}
    Catégorie: ${categoryName || 'Non spécifié'}
    Spécifications: ${specifications?.map(s => `${s.key}: ${s.value}`).join(', ') || 'Aucune'}
    
    La description doit:
    - Être concise (100-150 mots)
    - Mettre en avant les avantages du produit
    - Être convaincante et professionnelle
    - Inclure un appel à l'action
    `;

    try {
      // Implementation would go here with OpenAI API
      // const response = await openai.createCompletion({
      //   model: "gpt-3.5-turbo",
      //   prompt: prompt,
      //   max_tokens: 200
      // });
      // return response.data.choices[0].text;
      
      return this.generateDescription(productData);
    } catch (error) {
      console.error('Error generating description with AI:', error);
      return this.generateDescription(productData);
    }
  }
  */
}

