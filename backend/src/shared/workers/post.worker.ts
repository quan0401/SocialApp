import { DoneCallback, Job } from 'bull';
import { IPostJobData } from '~post/interfaces/post.interface';
import { postService } from '~services/db/post.service';

export class PostWorker {
  public async addPost(job: Job, done: DoneCallback): Promise<void> {
    const { key, value } = job.data as IPostJobData;

    // add post to db service
    await postService.addPost(key!, value!);
    job.progress(100);
    done(null, job.data);
  }
  public async deletePost(job: Job, done: DoneCallback): Promise<void> {
    const { keyOne, keyTwo } = job.data as IPostJobData;

    await postService.deletePost(keyOne!, keyTwo!);

    job.progress(100);
    done(null, job.data);
  }

  public async updatePost(job: Job, done: DoneCallback): Promise<void> {
    const { key, value } = job.data as IPostJobData;

    await postService.editPost(key!, value!);
    job.progress(100);
    done(null, job.data);
  }
}
