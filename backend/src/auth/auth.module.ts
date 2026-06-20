import { Global, Module } from '@nestjs/common';
import { AuthzService } from './authz.service';
import { GqlAuthGuard } from './gql-auth.guard';

@Global()
@Module({
  providers: [AuthzService, GqlAuthGuard],
  exports: [AuthzService, GqlAuthGuard],
})
export class AuthModule {}
