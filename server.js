const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const filePath = path.join(__dirname, 'startup.json');

const server = http.createServer(async (req, res) => {

    // GET all ideas
    if (req.url === '/api/ideas' && req.method === 'GET') {
        try {
            const data = await fs.promises.readFile(filePath, 'utf-8');
            const ideas = JSON.parse(data);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(ideas));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error reading file');
        }
    }

    // GET single idea
    else if (req.url.startsWith('/api/ideas/') && req.method === 'GET') {
        const id = parseInt(req.url.split('/')[3]);

        const data = await fs.promises.readFile(filePath, 'utf-8');
        const ideas = JSON.parse(data);

        const idea = ideas.find(i => i.id === id);

        if (idea) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(idea));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Idea Not Found');
        }
    }

    // POST create idea
    else if (req.url === '/api/ideas' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const newIdea = JSON.parse(body);

            const data = await fs.promises.readFile(filePath, 'utf-8');
            const ideas = JSON.parse(data);

            const newId = ideas.length > 0 ? ideas[ideas.length - 1].id + 1 : 1;
            newIdea.id = newId;

            ideas.push(newIdea);

            await fs.promises.writeFile(filePath, JSON.stringify(ideas, null, 2));

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newIdea));
        });
    }

    // PUT update idea
    else if (req.url.startsWith('/api/ideas/') && req.method === 'PUT') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const id = parseInt(req.url.split('/')[3]);
            const updatedData = JSON.parse(body);

            const data = await fs.promises.readFile(filePath, 'utf-8');
            let ideas = JSON.parse(data);

            const index = ideas.findIndex(i => i.id === id);

            if (index !== -1) {
                ideas[index] = { ...ideas[index], ...updatedData, id };

                await fs.promises.writeFile(filePath, JSON.stringify(ideas, null, 2));

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(ideas[index]));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Idea Not Found');
            }
        });
    }

    // DELETE idea
    else if (req.url.startsWith('/api/ideas/') && req.method === 'DELETE') {
        const id = parseInt(req.url.split('/')[3]);

        const data = await fs.promises.readFile(filePath, 'utf-8');
        let ideas = JSON.parse(data);

        const index = ideas.findIndex(i => i.id === id);

        if (index !== -1) {
            const deleted = ideas.splice(index, 1)[0];

            await fs.promises.writeFile(filePath, JSON.stringify(ideas, null, 2));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(deleted));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Idea Not Found');
        }
    }

    // Fallback route
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Startup Ideas API running on http://localhost:${PORT}`);
});

