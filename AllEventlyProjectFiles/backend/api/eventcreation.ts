import {Pool} from 'pg';
import * as dotenv from 'dotenv';
import {IncomingMessage, ServerResponse} from 'http';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

// Helper function to parse JSON body
const parseJsonBody = (req: IncomingMessage) =>
    new Promise<any>((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body)); // Parse body as JSON
            } catch (err) {
                reject(err); // Reject if there is an error parsing JSON
            }
        });
    });

// Vercel's CORS wrapper
const allowCors = (fn: (req: IncomingMessage, res: ServerResponse) => Promise<void>) =>
    async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*'); // Or use a specific frontend URL
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
        }

        return await fn(req, res);
    };

const prepareQueryData = (body: Record<string, any>, columns: string[]) => {
    const providedColumns: string[] = [];
    const values: any[] = [];
    const placeholders: string[] = [];

    columns.forEach((column, index) => {
        if (body[column] !== undefined) {
            providedColumns.push(column);
            values.push(body[column]); // Add actual value
            placeholders.push(`$${values.length}`); // Add placeholder
        } else {
            providedColumns.push(column);
            placeholders.push('DEFAULT'); // Use DEFAULT for missing fields
        }
    });

    return { providedColumns, values, placeholders };
};

const validateInput = (body: Record<string, any>, requiredFields: string[]) => {
    const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null);

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
};

const requiredFields = [
    'hostEmail',
    'hostFirstName',
    'hostLastName',
    'address',
];

const handler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method === 'POST') {
        try {
            const body = await parseJsonBody(req);
            validateInput(body, requiredFields);
            const hostFullName = `${body.hostFirstName} ${body.hostLastName}`;
            const columns = [
                'hostEmail',
                'hostFullName',
                'eventName',
                'address',
                'date',
                'startTime',
                'endTime',
                'timeZone',
                'selectedLayout',
                'selectedImage',
                'backGroundColor',
                'fontColor',
                'font',
                'isPrivate',
                'recurring',
                'recurrenceFrequency',
                'recurrenceEndDate',
                'requestChildCount',
                'limitGuests',
                'maxAdditionalGuests',
                'notifyRSVPs',
            ];
            const { providedColumns, values, placeholders } = prepareQueryData(
                { ...body, hostFullName }, // Add hostFullName to the body for query preparation
                columns
            );
            const query = `
                INSERT INTO Events (${providedColumns.join(', ')})
                VALUES (${placeholders.join(', ')})`;

            await pool.query(query, values);
            res.statusCode = 201;
            res.end(JSON.stringify({ message: 'Event successfully created.'} ));
        } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({message: "Server error creating event. Please try again."}));
            return;
        }
    } else {
        res.statusCode = 405;
        res.end(JSON.stringify({message: 'Method Not Allowed'}));
        console.log("Method: " + req.method);
        return;
    }
};
export default allowCors(handler);