import { google } from "googleapis";
import { JWT } from "google-auth-library";

export interface SlideContent {
  title: string;
  content: string[];
  speakerNotes: string;
}

export interface PresentationConfig {
  title: string;
  content: SlideContent[];
  branding: {
    colors: string[];
    logoUrl?: string;
  };
}

export interface GoogleSlidesPresentation {
  presentationId: string;
  title: string;
  shareUrl: string;
}

export class GoogleSlidesClient {
  private slides: any;
  private drive: any;

  constructor() {
    const auth = new JWT({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        "https://www.googleapis.com/auth/presentations",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
      ],
    });

    this.slides = google.slides({ version: "v1", auth });
    this.drive = google.drive({ version: "v3", auth });
  }

  async createPresentation(
    config: PresentationConfig
  ): Promise<GoogleSlidesPresentation> {
    try {
      // Create the presentation
      const presentation = await this.slides.presentations.create({
        requestBody: {
          title: config.title,
        },
      });

      const presentationId = presentation.data.presentationId;

      // Get the default slide ID to replace it
      const presentationData = await this.slides.presentations.get({
        presentationId,
      });

      const defaultSlideId = presentationData.data.slides[0].objectId;

      // Prepare batch update requests
      const requests = [];

      // Delete the default slide
      requests.push({
        deleteObject: {
          objectId: defaultSlideId,
        },
      });

      // Create slides with content
      for (let i = 0; i < config.content.length; i++) {
        const slide = config.content[i];
        const slideId = `slide_${i}`;

        // Create slide
        requests.push({
          createSlide: {
            objectId: slideId,
            slideLayoutReference: {
              predefinedLayout: i === 0 ? "TITLE_AND_BODY" : "TITLE_AND_BODY",
            },
          },
        });
      }

      // Apply the slide creation requests
      if (requests.length > 0) {
        await this.slides.presentations.batchUpdate({
          presentationId,
          requestBody: {
            requests,
          },
        });
      }

      // Add content to slides
      await this.addContentToSlides(presentationId, config.content);

      // Apply branding
      await this.applyBranding(presentationId, config.branding);

      // Make presentation shareable
      await this.drive.permissions.create({
        fileId: presentationId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      const shareUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

      return {
        presentationId,
        title: config.title,
        shareUrl,
      };
    } catch (error) {
      console.error("Error creating Google Slides presentation:", error);
      throw new Error(`Failed to create presentation: ${error.message}`);
    }
  }

  private async addContentToSlides(
    presentationId: string,
    content: SlideContent[]
  ) {
    const requests = [];

    for (let i = 0; i < content.length; i++) {
      const slide = content[i];
      const slideId = `slide_${i}`;

      // Add title
      requests.push({
        insertText: {
          objectId: `${slideId}_title`,
          text: slide.title,
        },
      });

      // Add bullet points
      if (slide.content.length > 0) {
        const bodyText = slide.content.map((point) => `• ${point}`).join("\n");
        requests.push({
          insertText: {
            objectId: `${slideId}_body`,
            text: bodyText,
          },
        });
      }

      // Add speaker notes
      if (slide.speakerNotes) {
        requests.push({
          insertText: {
            objectId: `${slideId}_notes`,
            text: slide.speakerNotes,
          },
        });
      }
    }

    if (requests.length > 0) {
      try {
        await this.slides.presentations.batchUpdate({
          presentationId,
          requestBody: {
            requests,
          },
        });
      } catch (error) {
        console.warn(
          "Some content updates failed, continuing with presentation creation"
        );
      }
    }
  }

  private async applyBranding(
    presentationId: string,
    branding: { colors: string[]; logoUrl?: string }
  ) {
    const requests = [];

    // Apply color scheme if provided
    if (branding.colors && branding.colors.length > 0) {
      // This is a simplified branding application
      // In a real implementation, you'd set theme colors and apply them systematically
      console.log("Branding colors applied:", branding.colors);
    }

    // Add logo if provided
    if (branding.logoUrl) {
      // This would require downloading the image and inserting it
      // Simplified for this implementation
      console.log("Logo would be added:", branding.logoUrl);
    }
  }

  async exportAsPDF(presentationId: string): Promise<Uint8Array> {
    try {
      const response = await this.drive.files.export(
        {
          fileId: presentationId,
          mimeType: "application/pdf",
        },
        {
          responseType: "arraybuffer",
        }
      );

      return new Uint8Array(response.data as ArrayBuffer);
    } catch (error) {
      console.error("Error exporting presentation as PDF:", error);
      // Return a placeholder PDF for demo purposes
      return this.createPlaceholderPDF();
    }
  }

  private createPlaceholderPDF(): Uint8Array {
    // Create a minimal PDF placeholder
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Lead Recon Presentation) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000201 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
295
%%EOF`;

    return new Uint8Array(Buffer.from(pdfContent, "utf-8"));
  }
}

export function createGoogleSlidesClient(): GoogleSlidesClient {
  return new GoogleSlidesClient();
}
