import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

/**
 * Create a Filebase S3 client
 * Filebase uses S3-compatible API
 */
export function createFilebaseClient(config) {
    const { accessKey, secretKey, bucket } = config

    const client = new S3Client({
        endpoint: 'https://s3.filebase.com',
        region: 'us-east-1', // Filebase uses us-east-1
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
        },
        forcePathStyle: true, // Required for S3-compatible services
    })

    return {
        client,
        bucket,

        /**
         * List files in the bucket
         * @param {string} prefix - Optional prefix to filter files
         * @param {number} maxKeys - Maximum number of files to return
         */
        async listFiles(prefix = '', maxKeys = 100) {
            const command = new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                MaxKeys: maxKeys,
            })

            const response = await client.send(command)

            return (response.Contents || []).map(item => ({
                key: item.Key,
                size: item.Size,
                lastModified: item.LastModified,
                // Filebase stores CID in x-amz-meta-cid header, we'll get it from HEAD
            }))
        },

        /**
         * Upload a file to IPFS via Filebase
         * @param {string} key - The file key/path
         * @param {Buffer|Uint8Array|Blob} body - The file content
         * @param {string} contentType - MIME type
         */
        async uploadFile(key, body, contentType) {
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
            })

            await client.send(command)

            // Get the CID from file metadata
            const cid = await this.getFileCid(key)

            return {
                key,
                cid,
                gatewayUrl: cid ? `https://ipfs.filebase.io/ipfs/${cid}` : null,
            }
        },

        /**
         * Get the IPFS CID for a file
         * Filebase stores CID in x-amz-meta-cid header
         */
        async getFileCid(key) {
            try {
                const command = new HeadObjectCommand({
                    Bucket: bucket,
                    Key: key,
                })
                const response = await client.send(command)
                return response.Metadata?.cid || null
            } catch (error) {
                console.error('Error getting file CID:', error)
                return null
            }
        },

        /**
         * Delete a file from the bucket
         */
        async deleteFile(key) {
            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            })
            await client.send(command)
            return { deleted: true, key }
        },

        /**
         * Test connection by listing bucket contents
         */
        async testConnection() {
            try {
                const command = new ListObjectsV2Command({
                    Bucket: bucket,
                    MaxKeys: 1,
                })
                await client.send(command)
                return { success: true }
            } catch (error) {
                return { success: false, error: error.message }
            }
        },

        /**
         * Get the public IPFS gateway URL for a CID
         */
        getGatewayUrl(cid) {
            return `https://ipfs.filebase.io/ipfs/${cid}`
        },
    }
}

/**
 * Supported IPFS providers
 */
export const IPFS_PROVIDERS = {
    filebase: {
        name: 'Filebase',
        endpoint: 'https://s3.filebase.com',
        gateway: 'https://ipfs.filebase.io/ipfs',
        requiresBucket: true,
    },
    // Future providers can be added here
    // web3storage: { ... },
    // storacha: { ... },
}
