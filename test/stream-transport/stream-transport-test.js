/* eslint no-unused-expressions:0, prefer-arrow-callback: 0 */
/* globals beforeEach, describe, it */

'use strict';

const chai = require('chai');
const expect = chai.expect;
const PassThrough = require('stream').PassThrough;
const StreamTransport = require('../../lib/stream-transport');
chai.config.includeStack = true;

class MockBuilder {
    constructor(envelope, message, messageId) {
        this.envelope = envelope;
        this.rawMessage = message;
        this.mid = messageId || '<test>';
    }

    getEnvelope() {
        return this.envelope;
    }

    messageId() {
        return this.mid;
    }

    createReadStream() {
        let stream = new PassThrough();
        setImmediate(() => stream.end(this.rawMessage));
        return stream;
    }

    getHeader() {
        return 'teretere';
    }
}

describe('Stream Transport Tests', function() {
    this.timeout(10000); // eslint-disable-line no-invalid-this

    it('Should expose version number', function() {
        let client = new StreamTransport();
        expect(client.name).to.exist;
        expect(client.version).to.exist;
    });

    describe('Send as stream', function() {
        it('Should send mail using unix newlines', function(done) {
            let client = new StreamTransport();
            let chunks = [],
                message = new Array(100).join('teretere\r\nvana kere\r\n');

            client.send(
                {
                    data: {},
                    message: new MockBuilder(
                        {
                            from: 'test@valid.sender',
                            to: 'test@valid.recipient'
                        },
                        message
                    )
                },
                function(err, info) {
                    expect(err).to.not.exist;

                    expect(info.envelope).to.deep.equal({
                        from: 'test@valid.sender',
                        to: 'test@valid.recipient'
                    });

                    expect(info.messageId).to.equal('<test>');

                    info.message.on('data', function(chunk) {
                        chunks.push(chunk);
                    });

                    info.message.on('end', function() {
                        let body = Buffer.concat(chunks);
                        expect(body.toString()).to.equal(message.replace(/\r\n/g, '\n'));
                        done();
                    });
                }
            );
        });

        it('Should send mail using windows newlines', function(done) {
            let client = new StreamTransport({
                newline: 'windows'
            });
            let chunks = [],
                message = new Array(100).join('teretere\nvana kere\n');

            client.send(
                {
                    data: {},
                    message: new MockBuilder(
                        {
                            from: 'test@valid.sender',
                            to: 'test@valid.recipient'
                        },
                        message
                    )
                },
                function(err, info) {
                    expect(err).to.not.exist;

                    info.message.on('data', function(chunk) {
                        chunks.push(chunk);
                    });

                    info.message.on('end', function() {
                        let body = Buffer.concat(chunks);
                        expect(body.toString()).to.equal(message.replace(/\n/g, '\r\n'));
                        done();
                    });
                }
            );
        });
    });

    describe('Send as buffer', function() {
        it('Should send mail using unix newlines', function(done) {
            let client = new StreamTransport({
                buffer: true
            });
            let message = new Array(100).join('teretere\r\nvana kere\r\n');

            client.send(
                {
                    data: {},
                    message: new MockBuilder(
                        {
                            from: 'test@valid.sender',
                            to: 'test@valid.recipient'
                        },
                        message
                    )
                },
                function(err, info) {
                    expect(err).to.not.exist;

                    expect(info.message.toString()).to.equal(message.replace(/\r\n/g, '\n'));
                    done();
                }
            );
        });

        it('Should send mail using windows newlines', function(done) {
            let client = new StreamTransport({
                newline: 'windows',
                buffer: true
            });
            let message = new Array(100).join('teretere\nvana kere\n');

            client.send(
                {
                    data: {},
                    message: new MockBuilder(
                        {
                            from: 'test@valid.sender',
                            to: 'test@valid.recipient'
                        },
                        message
                    )
                },
                function(err, info) {
                    expect(err).to.not.exist;

                    expect(info.message.toString()).to.equal(message.replace(/\n/g, '\r\n'));
                    done();
                }
            );
        });
    });
});
