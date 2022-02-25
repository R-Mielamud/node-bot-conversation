# NodeConversation

Zero-dependency library for chat-bot creators with deadlines.

It allows you to describe a conversation, talk with user according to your schema and restore it, if something went wrong.

NodeJS version of [the Python library](https://pypi.org/project/pyconversation/)

### Table of contents

-   <a href="#quickstart">Quickstart</a>
-   <a href="#messages">Messages</a>
    -   <a href="#text">Text</a>
    -   <a href="#group">Group</a>
    -   <a href="#ask">Ask</a>
    -   <a href="#switch">Switch</a>
    -   <a href="#list-ask">ListAsk</a>
    -   <a href="#terminate-group">TerminateGroup</a>
    -   <a href="#own-messages">Creating Own Messages</a>
    -   <a href="#message-transfer">MessageTransfer</a>
-   <a href="#loggers">Loggers</a>
    -   <a href="#dict-logger">DictLogger</a>
    -   <a href="#json-file-logger">JsonFileLogger</a>
    -   <a href="#own-loggers">Creating Own Loggers</a>
-   <a href="#sender">Message Sender</a>
-   <a href="#compatibility">Compatibility</a>

## <a id="quickstart"></a>Quickstart

### First we need to create a message schema, which consists of messages.

Messages describe chat-bot's actions. For instance, send a text message, which doesn't need any feedback or ask a question. Each message has a unique id. Most common types of messages are `Group`, `Text` and `Ask`.

For full details about different message types <a href="#messages">see Messages</a>

`Group` is a kind of container, that holds list of other messages.

`Text` sends a text message, which doesn't require any feedback.

`Ask` sends a text message and waits for an answer

Enough theory, let's see an example!

```typescript
import { Group, Text, Ask } from "node-conversation";

const fruitBotConversation = new Group({
    id: "root",
    children: [
        new Text({ id: "root.hello", text: "Hello!" }),
        new Ask({ id: "root.fruits", text: "What fruits do you like?" }),
        new Text({ id: "root.bye", text: "Bye" }),
    ],
});
```

In this example, we create a schema for simple bot, who asks which fruits does user like. Root message is a `Group`. It holds a block of messages. First of them is a `Text` which sends user a greeting message. Second one (`Ask`) asks about user's favorite fruit and waits for answer. And finally, third `Text` message sends `Bye` to user.

### Second step - we need a logger

Logger is an object, which stores user's answers and message history. This library exposes 2 loggers:

-   `DictLogger` - stores data in a dictionary
-   `JsonFileLogger` - takes file path as a parameter and stores json data in this file

If you need something different, <a href="#own-loggers">see Creating Own Loggers</a>

But now let's use `DictLogger`

```typescript
import { DictLogger } from "node-conversation";

const logger = new DictLogger();
```

That's all!

For full loggers documentation <a href="#loggers">see Loggers</a>

### But how to send those messages?

The answer's simple - using a `MessageSender`!

Example code:

```typescript
import { Group, Text, Ask, DictLogger, MessageSender } from "node-conversation";

// Conversation from step 1
const fruitBotConversation = new Group({
    id: "root",
    children: [
        new Text({ id: "root.hello", text: "Hello!" }),
        new Ask({ id: "root.fruits", text: "What fruits do you like?" }),
        new Text({ id: "root.bye", text: "Bye" }),
    ],
});

// Logger from step 2
const logger = new DictLogger();

// Initialize a message sender
const sender = new MessageSender({
    root: fruitBotConversation, // Our conversation
    logger: logger, // Our logger
    send: console.log, // A send function, which takes a string and sends the message. In this case, we use console.log
});

// Answer to the question before the first one is always empty
let answer: string | undefined;

// Send messages!
while (true) {
    // Send messages one by one, until we run into a message, which requires an answer
    // This function takes answer to previous question as a parameter
    sender.sendAllSkippable(answer);

    // If all messages sent
    if (sender.finished) {
        // Dispose of sender's resources (like open files) and get the result!
        console.log("\nResult:", sender.finalize());
        break;
    }

    // If not all messages have been sent and we still need an answer, ask!
    // Note: `input` is not a built-in function, but you can implement it yourthis! For example, you can use readline library.
    answer = input();
}
```

Done! If you run you'll get the following in the console:

```
Hello!
What fruits do you like?
<your answer'll be here>
Bye

Result: {'root.fruits': '<your answer>'}
```

And one more example with event emitter (like in real chat-bots):

```typescript
const bot = ... // Initialize chat bot

let sender: MessageSender | undefined;

bot.on("connection", userId => {
    sender = new MessageSender({
        root: conversation, // Our conversation
        logger: logger, // Our logger
        send: (text) => bot.send(userId, text)
    });

    sender.sendAllSkippable();
});

bot.on("message", (userId, message) => {
    sender.sendAllSkippable(message);

    if (sender.finished) {
        console.log("\nResult:", sender.finalize());
        sender = undefined;
    }
});
```

For full message sender documentation <a href="#sender">see Message Sender</a>

### You've created your first chat-bot with clever conversation! Here quick tutorial ends.

## <a id="messages"></a>Messages

### <a id="text"></a>Text

Text message sends some text, which doesn't require user's answer

Constructor parameters:

-   `id` (string) - unique message id
-   `text` (string) - text to send

Usage example:

```typescript
new Text({ id: "hello", text: "Hello, user!" });
```

### <a id="group"></a>Group

Group is a message, which doesn't send anything and doesn't require an answer. It's just a container for a list of messages

Constructor parameters:

-   `id` (string) - unique message id
-   `children` (message\[\]) - list of messages to send

Usage example:

```typescript
new Group({
    id: "group",
    children: [
        new Text({ id: "hello", text: "Hello!" }),
        new Text({ id: "bye", text: "Good bye!" }),
    ],
});
```

### <a id="ask"></a>Ask

Ask message send some text to user and waits for an answer

Constructor parameters:

-   `id` (string) - unique message id
-   `text` (string) - question text

Usage example:

```typescript
new Ask({ id: "name", text: "What's your name?" });
```

### <a id="switch"></a>Switch

Switch message asks user a question and sends a message depending on user's answer.

Constructor parameters:

-   `id` (string) - unique message id
-   `text` (string) - question text
-   `answerMap` (record&lt;str, message>) - dict, where key is user's answer and value is a message
-   `fallback` (message?) - message, which'll be sent if answer doesn't match anything in `answerMap` dict
-   `repeatOnFallback` (boolean?) - if true, after fallback was sent question is asked over and over again until answer matches something in `answerMap` dict

Usage example:

```typescript
new Switch({
    id: "fruit"
    text: "What fruit do you like?"
    answerMap={
        apple: new Text({ id: "apple", text: "Yeah, apples are delicious!" }),
        peach: new Text({ id: "peach", text: "Me too!" }),
        feijoa: new Text({ id: "feijoa", text: "I don't know that fruit!" }),
    },
    fallback: new Text({ id: "dont_understand", text: "Sorry, I didn't understand you" }),
    repeatOnFallback: true
});
```

### <a id="list-ask"></a>ListAsk

ListAsk asks user a question and waits for several answers.

In result dictionary it's represented by an array.

Constructor parameters:

-   `id` (string) - unique message id
-   `text` (string) - question text
-   `stopCommand` (string) - if user sends this string as an answer, ListAsk finishes waiting for answers
-   `maxCount` (number?) - maximal count of answers

Usage example:

```typescript
new ListAsk({
    id: "fruits",
    text: "What fruits do you like? Enter 'that's all' if you can't remember any more",
    stopCommand: "that's all",
    maxCount: 10,
});
```

### <a id="terminate-group"></a>TerminateGroup

TerminateGroup sends another message and then terminates sending group, inside which it is located

Constructor parameters:

-   `id` (string) - unique message id
-   `child` (message?) - message to send before terminating the group

Usage example:

```typescript
new Group({
    // This group's gonna be terminated
    id: "group",
    children: [
        new Text({ id: "hello", text: "Hello!" }),
        new Switch({
            id: "bye_condition",
            text: "Can I say bye?",
            answer_map: {
                yes: new Text({ id: "bye", text: "Good bye!" }),
            },
            fallback: new TerminateGroup({
                id: "terminate",
                child = new Text({ id: "eh", text: "Eh..." }),
            }),
        }),
        new Text({ id: "what", text: "What?!" }), // This will not be sent,
    ],
});
```

### <a id="own-messages"></a>Creating Own Messages

Every message is a class, so to create your own message, you just need to inherit `BaseMessage` class (It can be imported like this: `import { BaseMessage } import "node-conversation"`)

Usage example:

```typescript
import {
    Text,
    BaseMessage,
    BaseLogger,
    MessageTransfer,
    MessageTransferGenerator,
} from "node-conversation";

interface IHello {
    id: string;
    username: string;
}

class HelloMessage extends BaseMessage {
    protected username: string;

    public constructor({ id, username }: IHello) {
        super(id); // BaseMessage takes one parameter - id
        this.username = username;
    }

    protected override *baseIterator(
        logger: BaseLogger
    ): MessageTransferGenerator {
        // This is an abstract method
        text_message = Text({
            id: `${this.id}.text`,
            text: `Hello, ${this.username}!`,
        });

        yield* text_message.iterator(logger);

        const answer = yield MessageTransfer({
            id: this.id,
            text: "Is it your real name?",
        });

        logger.log(this.id, answer);
    }
}
```

As you can see, each message has an iterator method, which takes logger as a parameter and returns a generator. Also, this message gets an answer and logs it to logger. Details on how to interact with logger and log answers will be explained in <a href="#loggers">Loggers</a>

But what is that `MessageTransfer` object? It's used to pass string message to sender and get an answer. Details in next article.

### <a id="message-transfer"></a>MessageTransfer

Message transfer is used to pass string message to sender and get an answer. It can be `yield`ed from message's generator.

Constructor parameters:

-   `id` (string) - message's unique id
-   `text` (string?) - text, which'll be sent to user or void, if you don't want to ask any questions, you just need an answer
-   `skip` (boolean?) - if true, this question doesn't need an answer and won't wait for it.
-   `terminate_group` (boolean?) - when this is true, group which intercepted such transfer processes it and terminates.

Usage example in upper **Creating Own Messages** section

## <a id="loggers"></a>Loggers

Loggers are used to store users' answers and message history.

Message history is a list, where question ids are stored. It's used to restore conversation. For example, if user has already answered several questions and suddenly the server stops, last sent message id will be taken from history, and conversation will begin from the last message.

### <a id="dict-logger"></a>DictLogger

DictLogger stores answers and history in-memory (in a dictionary). So it's just an example to play with the library. Don't use it in production code.

No constructor parameters.

Usage example:

```typescript
const logger = new DictLogger();
```

### <a id="json-file-logger"></a>JsonFileLogger

JsonFileLogger stores everything in a JSON file. JSON file stays on the computer anyway, so when server suddenly stops and the reboots, your bot'll be able to continue conversation from the right place.

Constructor parameters:

-   `filePath` (str) - JSON file's absolute path. It must be unique between all conversations on this server.

Usage example:

```typescript
const logger = new JsonFileLogger(__dirname + "/conversation.json");
```

### <a id="own-loggers"></a>Creating Own Loggers

If you need to create your own logger (and you'll need it more often, than creating own messages) you need to inherit the `BaseLogger` class.

It has the following abstract methods:

-   `log` (-> void) - stores answer by message's unique id

    Parameters:

    -   `id` (string) - message unique id
    -   `value` (string) - answer

-   `setArray` (-> void) - initializes empty list in answer dictionary using message unique id as a key

    Parameters:

    -   `id` (string) - message unique id

-   `addArrayItem` (-> void) - add item to existing list using message id as answer dictionary key

    Parameters:

    -   `id` (string) - message unique id
    -   `value` (string) - value to add to list

-   `get` (-> string | string\[\] | undefined) - get message answer or list of answers by message id if exists

    Parameters:

    -   `id` (string) - message unique id

-   `getResultDict` (-> Record&lt;string, str | str\[\]>) - get full answer dictionary

    No parameters

And also the following virtual methods (not necessary to implement):

-   `resetHistory` (-> void) - remove all elements from message history list

    No parameters

-   `logLastId` (-> void) - add message id to message history list

    Parameters:

    -   `id` (string) - message unique id

-   `getLastId` (-> string?) - get last sent message id (last element in message history list)

    No parameters

-   `finalize` (-> void) - dispose of logger's resources (open files, socket connections, etc.)

    **Note**: This method is called when the conversation is finished. So, for instance, `JsonFileLogger` deletes it's data file in this method.

    No parameters

Usage example:

```typescript
import { BaseLogger } from "node-conversation";

class MySocketLogger extends BaseLogger {
    protected socket: Socket;

    public constructor() {
        this.connectSocket();
    }

    public log(id: string, value: string) {
        this.socket.emit("SET_OR_REPLACE", { id, value });
    }

    public setArray(id: string) {
        this.socket.emit("SET_OR_REPLACE", { id, value: [] });
    }

    public addArrayItem(id: string, value: string) {
        this.socket.emit("ADD_ARRAY_ITEM", { id, value });
    }

    public get(id: str): string | string[] {
       return this.socket.emit("GET", { id });
    }

    public getResultDict(): Record<string, string | string[]> {
       return this.socket.emit("GET_ALL");
    }

    public resetHistory() {
        this.socket.emit("SET_HISTORY", []);
    }

    public logLastId(id: string) {
        return this.socket.emit("ADD_HISTORY", id);
    }

    public getLastId(id: string): string | undefined {
        if (!this.socket.emit("HISTORY_EMPTY")) {
            return this.socket.emit("GET_LAST_IN_HISTORY");
        }
    }

    public finalize() {
        this.socket.emit("CLEAR_EVERYTHING");
        this.disconnectSocket();
    }

    protected connectSocket() {
        this.socket = ... // We'll log our data using a socket
    }

    protected disconnectSocket() {
        this.socket.disconnect();
        this.socket = undefined;
    }
}
```

## <a id="sender"></a>Message Sender

Message sender is used to simplify conversation restoring and message sending.

Constructor parameters:

-   `root` (message) - root message (aka message schema)
-   `logger` (logger) - logger
-   `send` (function (string) -> void) - send function (takes string and sends it to user)
-   `headlineText` (string?) - text, which'll be sent to user whent message sender is constructed. Whether conversation is constructed or restored, it's sent anyway.
-   `stopCommand` (string?) - if user sends this as an answer, conversation terminates.

Exposed properties:

-   `finished` (boolean) - is conversation finished (true if all messages have been sent or conversation has been stopped by stop command)
-   `terminated` (boolean) - is conversation terminated (true if conversation was stopped by stop command)

Exposed methods:

-   `sendAllSkippable`
    Send all messages until sender runs into a message, which requires an answer.

    Parameters:

    -   `prevAnswer` (string?) - answer to previous message

See usage example in <a href="#quickstart">Quickstart</a>

## <a id="compatibility"></a>Compatibility

This library is compatible with any NodeJS>=10

&copy; 2021 Roman Melamud
