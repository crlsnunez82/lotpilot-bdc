# Prisma notes

## Common local flow
```bash
npm run prisma:generate
npm run prisma:push
npm run seed
```

## Reset local database
```bash
npm run db:reset
```

## Migrations
Create a development migration with:
```bash
npm run prisma:migrate -- --name your_change_name
```

Use `prisma db push` for quick local iteration only if that matches your workflow policy.


## Production policy
Use versioned migrations and deploy with:
```bash
npm run prisma:deploy
```
