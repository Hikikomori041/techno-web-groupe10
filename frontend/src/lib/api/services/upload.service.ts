import { apiClient } from '@/lib/api/clients';
import { ENDPOINTS } from '@/lib/api/endpoints';

export interface UploadImageResponse {
    url: string;
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
}

export const uploadService = {
    /**
     * Upload a product image
     * @param file - Image file to upload
     * @returns Upload response with image URL
     */
    uploadProductImage: async (file: File): Promise<UploadImageResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await apiClient.post<UploadImageResponse>(
            ENDPOINTS.UPLOAD.IMAGE,
            formData,
            {
                ...ENDPOINTS.CREDENTIALS.INCLUDE,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return res.data;
    },

    /**
     * Upload multiple images
     * @param files - Array of image files
     * @returns Array of upload responses
     */
    uploadMultipleImages: async (files: File[]): Promise<UploadImageResponse[]> => {
        const uploadPromises = files.map(file => uploadService.uploadProductImage(file));
        return Promise.all(uploadPromises);
    },
};

