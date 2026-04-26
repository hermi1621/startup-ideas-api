const http = require('http');
const ideas = require('./data/ideas.json');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {

    // GET all ideas
    if (req.url === '/api/ideas' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(ideas));

    // GET single idea
    } else if (req.url.startsWith('/api/ideas/') && req.method === 'GET') {
        const ideaId = req.url.split('/')[3];
        const idea = ideas.find(i => i.id === parseInt(ideaId));

        if (idea) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(idea));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Idea Not Found');
        }

    // POST create idea
    } else if (req.url === '/api/ideas' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const newIdea = JSON.parse(body);
            const savedIdea = await addIdea(newIdea);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(savedIdea));
        });

    // PUT update idea
    } else if (req.url.startsWith('/api/ideas/') && req.method === 'PUT') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const ideaId = parseInt(req.url.split('/')[3]);
            const updatedData = JSON.parse(body);

            updatedData.id = ideaId;

            const updatedIdea = await updateIdea(updatedData);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updatedIdea));
        });

    // DELETE idea
    } else if (req.url.startsWith('/api/ideas/') && req.method === 'DELETE') {
        const ideaId = parseInt(req.url.split('/')[3]);
        const deletedIdea = await deleteIdea(ideaId);

        if (deletedIdea) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(deletedIdea));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Idea Not Found');
        }

    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});


// ➕ ADD IDEA
const addIdea = async (idea) => {
    const filePath = path.join(__dirname, 'data', 'ideas.json');
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const ideas = JSON.parse(data);

    const newId = ideas.length > 0 ? ideas[ideas.length - 1].id + 1 : 1;
    idea.id = newId;

    ideas.push(idea);

    await fs.promises.writeFile(filePath, JSON.stringify(ideas, null, 2));

    return idea;
};


// ✏️ UPDATE IDEA
const updateIdea = async (idea) => {
    const filePath = path.join(__dirname, 'data', 'ideas.json');
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const ideas = JSON.parse(data);

    const index = ideas.findIndex(i => i.id === idea.id);

    if (index !== -1) {
        ideas[index] = idea;
        await fs.promises.writeFile(filePath, JSON.stringify(ideas, null, 2));
    }

    return idea;
};


// ❌ DELETE IDEA
const deleteIdea = async (id) => {
    const filePath = path.join(__dirname, 'data', 'ideas.json');
    const data = await fs.promises.readFile(filePath, 'utf-8');
    let ideas = JSON.parse(data);

    const index = ideas.findIndex(i => i.id === id);

    if (index !== -1) {
        const deleted = ideas.splice(index, 1)[0];
        await fs.promises.writeFile(filePath, JSON.stringify(ideas, null, 2));
        return deleted;
    }

    return null;
};


const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Startup Ideas API running on port ${PORT}`);
});
