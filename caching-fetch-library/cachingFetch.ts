// You may edit this file, add new files to support this file,
// and/or add new dependencies to the project as you see fit.
// However, you must not change the surface API presented from this file,
// and you should not need to change any other files in the project to complete the challenge

import { useEffect, useState } from "react";
import {appCache, isCached, updateCache} from "./appCache";

type UseCachingFetch = (url: string) => {
  isLoading: boolean;
  data: unknown;
  error: Error | null;
};

/**
 * 1. Implement a caching fetch hook. The hook should return an object with the following properties:
 * - isLoading: a boolean that is true when the fetch is in progress and false otherwise
 * - data: the data returned from the fetch, or null if the fetch has not completed
 * - error: an error object if the fetch fails, or null if the fetch is successful
 *
 * This hook is called three times on the client:
 *  - 1 in App.tsx
 *  - 2 in Person.tsx
 *  - 3 in Name.tsx
 *
 * Acceptance Criteria:
 * 1. The application at /appWithoutSSRData should properly render, with JavaScript enabled, you should see a list of people.
 * 2. You should only see 1 network request in the browser's network tab when visiting the /appWithoutSSRData route.
 * 3. You have not changed any code outside of this file to achieve this.
 * 4. This file passes a type-check.
 *
 */
export const useCachingFetch: UseCachingFetch = (url:string) => {
  const [isLoading, setLoading] = useState(appCache?.[url]?.data ? false : true);
  const [data, setData] = useState<unknown>(appCache?.[url]?.data || null);
  const [error, setError] = useState<Error | null>(appCache?.[url]?.error || null);

  useEffect(() => {
    // API req
    const fetchData = async (url:string):Promise<void> => {
      try{
        setLoading(true);
        const resp = await fetch(url);
        if(!resp.ok){
          throw new Error(`HTTP error Status:${resp.status}`);
        }
        const data = await resp.json();
        // data is set in the hook 
        setData(data);
        // appCache is updated
        updateCache({[url]:{data, error:null}});
      }catch(error:any){
        console.error("An error happend while fetching the data.", error);
        const err = error instanceof Error ? error : new Error("An error happend while fetching the data.")
        setError(err);
        updateCache({[url]:{data:null, error:err}});
      }finally{
        setLoading(false);
      }
    } 
    // if url is not found in appCache make a request;
    if(!data){
      //trigger request
      fetchData(url);
    }

    return () => {
      // cleanup in case component gets dismounted before fetch ends
    }
  },[url]);

  return {
    data,
    isLoading,
    error,
  };
};

/**
 * 2. Implement a preloading caching fetch function. The function should fetch the data.
 *
 * This function will be called once on the server before any rendering occurs.
 *
 * Any subsequent call to useCachingFetch should result in the returned data being available immediately.
 * Meaning that the page should be completely serverside rendered on /appWithSSRData
 *
 * Acceptance Criteria:
 * 1. The application at /appWithSSRData should properly render, with JavaScript disabled, you should see a list of people.
 * 2. You have not changed any code outside of this file to achieve this.
 * 3. This file passes a type-check.
 *
 */
export const preloadCachingFetch = async (url: string): Promise<void> => {
  // API req
    try{
      const resp = await fetch(url);
      if(!resp.ok){
        throw new Error(`HTTP error Status:${resp.status}`);
      }
      const data = await resp.json();
      // appCache is updated
      updateCache({[url]:{data, error:null}});
    }catch(error:any){
      console.error("An error happend while fetching the data.", error);
      const err = error instanceof Error ? error : new Error("An error happend while fetching the data.")
      updateCache({[url]:{data:null, error:err}});
    }
};

/**
 * 3.1 Implement a serializeCache function that serializes the cache to a string.
 * 3.2 Implement an initializeCache function that initializes the cache from a serialized cache string.
 *
 * Together, these two functions will help the framework transfer your cache to the browser.
 *
 * The framework will call `serializeCache` on the server to serialize the cache to a string and inject it into the dom.
 * The framework will then call `initializeCache` on the browser with the serialized cache string to initialize the cache.
 *
 * Acceptance Criteria:
 * 1. The application at /appWithSSRData should properly render, with JavaScript enabled, you should see a list of people.
 * 2. You should not see any network calls to the people API when visiting the /appWithSSRData route.
 * 3. You have not changed any code outside of this file to achieve this.
 * 4. This file passes a type-check.
 *
 */
export const serializeCache = (): string => {
  try{
    return JSON.stringify(appCache);
  }catch(err:any){
    console.error("An error happened while serializing cache")
    return JSON.stringify({error:"An error happened while serializing cache"});
  }
};

export const initializeCache = (serializedCache: string): void => {
  try{
    const deserializedCache = JSON.parse(serializedCache);
    updateCache(deserializedCache);
  }catch(err:any){
    console.error("An error happened while initializing the cache", err);
  }
};

export const wipeCache = (): void => {
  for(const key in appCache){
    delete appCache[key];
  }
};
