# The Game

Full stack application for Wunderdog to use while playing THE GAME

Don't pay attention to this readme. It contains nothing of value.

## Get it running

Currently the best way to run this thing is to run 

```sh 
pnpm i -r
pnpm --filter client build
pnpm --filter server build
pnpm --filter server start
```

This should get the whole thing running at localhost:3000

You'll need to compile and restart the whole thing when you make changes (not hot reloading here).
