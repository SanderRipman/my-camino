import fs from 'node:fs';
import crypto from 'node:crypto';
const path='assets/santiago-4-ser.jpg';
const data=fs.readFileSync(new URL(path,import.meta.url));
const sha=crypto.createHash('sha256').update(data).digest('hex');
if(data.length!==436407) throw new Error(`Unexpected SER image size ${data.length}`);
if(sha!=='f055d6cc88a62d44f0aa08b704d67b8f50f4475a9639903653cd66463edf7b9c') throw new Error(`Unexpected SER image SHA ${sha}`);
console.log('SER image original-byte QA passed: 1200x1600 approved source, 436407 bytes.');
