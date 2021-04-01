# SentinelOne API

Backend Developer — Apps Team

The challenge - shall you decide to accept it - is to design and implement a proof of concept of an integration platform between your company’s backend and a series of partners’ APIs.

Such a system is going to be placed between your company’s big backend and a set of different APIs that are highly dependent on the partner.

### Technical details

You can expect the payload coming from the origin system (aka: your coworkers) to be something like this:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "examples": [
    {
      "filename": "file.txt",
      "sha1": "77a8d60ec5f24c7e41f1f1791072c19394e28ac8",
      "content": "https://secure.storage.com/infected.zip"
    },
    {
      "filename": "file.txt",
      "sha1": "77a8d60ec5f24c7e41f1f1791072c19394e28ac8",
      "content": "file:///home/directory/infected.zip"
    }
  ],
  "required": ["filename", "sha1"],
  "properties": {
    "filename": {
      "type": "string"
    },
    "sha1": {
      "type": "string"
    },
    "content": {
      "type": "string"
    }
  }
}
```

> Note: the content property can either be an URL to fetch the data from the network or from your local file system. Make sure to handle both cases. The resource is not guaranteed to be present.

When receiving such a request, you might need to query one or more partner APIs to get more information about the potential threat you just received.

For this exercise, we will suppose there are only two types of integrations, whose API request/response look something like this:

### Partner type 1 - Sandboxing

Send the content of the file as a POST request, content type application/octet-stream to the specified URL.

Unfortunately the partner n.1 is not that good at documenting the API, so all you know about the response is this example:

```json
{
  "risk": "HIGH",
  "threat-type": "virus"
}
```

…which is not comprehensive of all the possible values, but you can expect that at least these two properties will always be present.

### Partner type 2 - SHA lookup

You can send a POST request to the specified url and forward the sha1 and fileName properties.

The response will look like this:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "examples": [
    {
      "r": "HIGH",
      "tt": "virus"
    }
  ],
  "required": ["r", "tt"],
  "properties": {
    "r": {
      "type": "string",
      "enum": ["HIGH", "MEDIUM", "LOW"]
    },
    "tt": {
      "type": "string",
      "enum": ["virus", "malware", "ransomware"]
    }
  }
}
```

You will have multiple partners for each integration type. You can assume to have something like this already defined somewhere in the code:

```json
[
  {
    "url": "http://api.integrator.com/sandbox",
    "type": "sandbox"
  },
  {
    "url": "http://api.integrator2.com/upload",
    "type": "sandbox"
  },
  {
    "url": "http://api.integrator3.com/lookup",
    "type": "sha"
  },
  {
    "url": "http://api.integrator4.com/check",
    "type": "sha"
  }
]
```

You can rearrange this data structure in the way that is most convenient to you.

You need to send the data to every partner defined in the array. There might be cases where a partner cannot be effectively used (not all the potential threats have the original file associated, so sandboxing cannot be used).

To make things a little bit more spicy, assume that our backend developers have some bugs in the code, so in some cases they might be sending incorrect payloads. On top of it, the partners are also having some hard time returning correct responses for every request, so add whatever is necessary to make sure you can handle incorrect data.

Once you have collected all the results, come up with a format to be returned to the backend. You have complete freedom over this.

### The rules of the game

- You can use any programming language/framework you’re comfortable with. I’m not gonna lie, if I can see it implemented in Clojure we might hire you instantly (no hiring guaranteed)
- You can go in detail as much as you want. As a rule of thumb, whenever you feel you’re not enjoying working on a particular part anymore, it means that’s probably good enough and you can move on.
- You’re free to use the testing methodology/typology you deem more appropriate. Yes, you can avoid to forcefully try to reach 100% coverage, we do not really care about that.
- You can take as much time as you want, and we promise we won’t take in consideration the time spent to solve the problem. So yes, you can avoid all these weird git hacks to fake your time or even worse, wipe out the entire git history at the end and then recreate the repo and do a single gigantic commit.
- Please include a README with installation instruction and document the design choices you did. This will speed up the follow up conversation we are going to have with you.

- It’s fine to make trade offs, just make sure to articulate why you decided to go in such direction
- If you find any incongruencies or something is not clear, feel free to write back and ask.

Once you’re done, please create a private GitHub repository and invite me (XVincentX) so I can take a look into.

# Submission

### Commands

```bash
# install dependencies
yarn
```

```bash
# run jest tests
yarn test
```

```bash
# start the api server run on port 7000 by default
yarn dev
```

> If you want to use a custom port create a `.env` file with your port. Look at `.env.example` for a reference

### Approach

For my solution I decided to use express to set up a simple express server. Leveraging typescript I created some helpful typings extracted from the challenge to stay true to the api schema. The main ones being:

```typescript
export type Integration = {
  url: string;
  type: INTEGRATION_TYPE;
};

export enum INTEGRATION_TYPE {
  SHA = "sha",
  SANDBOX = "sandbox",
  UNKNOWN = "unknown",
}

export enum THREAT_TYPE {
  MALWARE = "malware",
  RANSOMWARE = "ransomware",
  VIRUS = "virus",
}

export enum RISK_LEVEL {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}
```

The project is set up into two directories. `/api` and `/lib`.

- The `/api` direct contains all pertaining explicitly to the functionality of the api server. Its used to create the `server`, register `/routes`, and create the `/controllers`.

- `/lib` contains any helpful utils. The most important being individual analayze threat functions for each integration type! There are also some other generic utils for fetching file contents, etc...

The last design decision for the endpoint was the return of the endpoint. I decided on always returning a status `200` and breaking the return into `data` and `errors` with a typing like below:

```typescript
type Response = {
  data: Array<{
    type: THREAT_TYPE;
    threat: RISK_LEVEL;
    integration: INTEGRATION_TYPE;
    url: string;
  }>;
  errors: Array<{
    message: string;
    integration?: INTEGRATION_TYPE;
    url?: string;
  }>;
};
```

The decision to do this was two fold:

- This will easily allow them to identify which integrations by their type+url. With that they cann see which integrations successfully processed the payload, as well as point out where were skipped or had internal errors. If we were to just skip integrations silently that did not apply to this specifc payload, it would be difficult to identify errors in our system and might be confusing to the consumer on which integrations are run in which scenarios

- Returning information for every integration also gives the consumer more flexibility by allowing them to filter to specific integrations after we process their payload or use that information any way they'd like.

  > It should be noted even though we return an entry for every integration, some of them immediately fail, if this payload is not applicable to them, instead of going through their entire analyze flow.

An example of what this might look like:

```typescript
const Payload = {
  filename: "test.zip";
  sha1: "abcd";
};


const Integrations: Integration[] = [
  {
    url: "http://api.integrator.com/sandbox",
    type: INTEGRATION_TYPE.SANDBOX,
  },
  {
    url: "http://api.integrator2.com/upload",
    type: INTEGRATION_TYPE.SANDBOX,
  },
  {
    url: "http://api.integrator3.com/lookup",
    type: INTEGRATION_TYPE.SHA,
  },
  {
    url: "http://api.integrator4.com/check",
    type: INTEGRATION_TYPE.SHA,
  },
];


const Response = {
  data: [
    {
      type: "ransomware",
      threat: "HIGH",
      integration: "sha",
      url: "http://api.integrator3.com/lookup",
    },
    {
      type: "ransomware",
      threat: "HIGH",
      integration: "sha",
      url: "http://api.integrator4.com/check",
    },
  ],
  errors: [
    {
      message: "Invalid File Path",
      integration: "sandbox",
      url: "http://api.integrator.com/sandbox",
    },
    {
      integration: "Invalid File Path",
      url: "http://api.integrator2.com/upload",
    },
  ],
};
```
