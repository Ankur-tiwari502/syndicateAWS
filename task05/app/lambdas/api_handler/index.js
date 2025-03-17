import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.target_table || "Events";

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);

        // Validate input
        if (!body.principalId || !body.content || typeof body.principalId !== "number") {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid request format" }),
            };
        }

        // Create event object
        const newEvent = {
            id: uuidv4(),
            principalId: body.principalId,
            createdAt: new Date().toISOString(),
            body: body.content,
        };

        // Save to DynamoDB
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: newEvent,
        }));

        return {
            statusCode: 201,
            body: JSON.stringify({ event: newEvent }),
        };
    } catch (error) {
        console.error("Error saving event:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
