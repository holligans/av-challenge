// I also liked the idea to implement this in a class

type CacheStorage = Record<string, {data:unknown, error:Error | null}>;

export let appCache:CacheStorage = {};

export function isCached(url:string):boolean{
    return !!appCache?.[url];
}

export function updateCache(newData:CacheStorage):void{
    Object.assign(appCache,newData);
    console.log("appCache",appCache);
}
