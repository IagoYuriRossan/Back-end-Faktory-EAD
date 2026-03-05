import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ModulesService } from './modules.service';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.modulesService.findOne(id);
  }

  @Get(':moduleId/lessons')
  findLessons(@Param('moduleId', ParseUUIDPipe) moduleId: string) {
    return this.modulesService.findLessonsByModule(moduleId);
  }
}
