import {Pool} from 'pg';
import * as dotenv from 'dotenv';
import {IncomingMessage, ServerResponse} from 'http';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

// Helper function to parse JSON body - written by ChatGPT
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

const handler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method === 'POST') {
        try {
            const body = await parseJsonBody(req);
            if(!body.email){
                res.statusCode = 400;
                res.end(JSON.stringify({message : 'Error: all fields are required.'}));
                return;
            }
            const [publicEventsResult, hostedEventsResult, attendingEventsResult] = await Promise.all([
                pool.query('SELECT GET_HOSTED_EVENTS();'),
                pool.query('SELECT GET_HOSTED_EVENTS($1);', [body.email]),
                pool.query('SELECT GET_ATTENDING_EVENTS($1);', [body.email])
            ]);
            const publicEvents = publicEventsResult.rows;
            const hostedEvents = hostedEventsResult.rows;
            const attendedEvents = attendingEventsResult.rows;
            const responseData = {
                publicEvents,
                hostedEvents,
                attendedEvents
            };
            //res.status(200).json(responseData);
            res.statusCode = 201;
            res.end(JSON.stringify(responseData));
            return;
        } catch (err) {
            console.error('Error fetching events:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({message: 'Internal server error.'}));
            console.log(err);
            return;
        }
    } else {
        res.statusCode = 405;
        res.end(JSON.stringify({message: 'Method Not Allowed'}));
        console.log("Method: "+req.method);
        return;
    }
};
export default allowCors(handler);