import { ApifyClient } from 'apify-client';

export interface ApifyActorInfo {
  id: string;
  name: string;
  title: string;
  description?: string;
  stats: {
    totalRuns: number;
    lastRunStartedAt?: string;
  };
  inputSchema?: any;
}

export interface ApifyRunInfo {
  id: string;
  actId: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  stats?: {
    inputBodyLen?: number;
    outputBodyLen?: number;
    requestsFinished?: number;
    requestsFailed?: number;
  };
  output?: {
    body?: string;
  };
}

export class ApifyService {
  private client: ApifyClient;

  constructor(apiKey: string) {
    this.client = new ApifyClient({ token: apiKey });
  }

  async validateApiKey(): Promise<{ valid: boolean; user?: any }> {
    try {
      const user = await this.client.user().get();
      return { valid: true, user };
    } catch (error) {
      return { valid: false };
    }
  }

  async getActors(): Promise<ApifyActorInfo[]> {
    try {
      const actorList = await this.client.actors().list();
      const items = actorList.items || [];
      
      return items.map((actor: any) => ({
        id: actor.id,
        name: actor.name,
        title: actor.title || actor.name,
        description: actor.description,
        stats: {
          totalRuns: actor.stats?.totalRuns || 0,
          lastRunStartedAt: actor.stats?.lastRunStartedAt,
        },
      }));
    } catch (error) {
      console.error('Error fetching actors:', error);
      throw new Error('Failed to fetch actors from Apify');
    }
  }

  async getActorInputSchema(actorId: string): Promise<any> {
    try {
      const actor = await this.client.actor(actorId).get();
      return actor.inputSchema || {};
    } catch (error) {
      console.error('Error fetching actor schema:', error);
      throw new Error('Failed to fetch actor input schema');
    }
  }

  async executeActor(actorId: string, inputs: any): Promise<ApifyRunInfo> {
    try {
      const run = await this.client.actor(actorId).call(inputs);
      
      return {
        id: run.id,
        actId: run.actId,
        status: run.status,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        stats: run.stats,
      };
    } catch (error) {
      console.error('Error executing actor:', error);
      throw new Error('Failed to execute actor');
    }
  }

  async getRunStatus(runId: string): Promise<ApifyRunInfo> {
    try {
      const run = await this.client.run(runId).get();
      
      return {
        id: run.id,
        actId: run.actId,
        status: run.status,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        stats: run.stats,
      };
    } catch (error) {
      console.error('Error fetching run status:', error);
      throw new Error('Failed to fetch run status');
    }
  }

  async getRunResults(runId: string): Promise<any[]> {
    try {
      const dataset = await this.client.dataset(runId).listItems();
      return dataset.items || [];
    } catch (error) {
      console.error('Error fetching run results:', error);
      return [];
    }
  }
}
