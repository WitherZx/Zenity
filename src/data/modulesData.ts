import { supabase } from '../config/supabase';

// Função para buscar módulos e áudios do Supabase e montar a estrutura antiga
export async function getModules() {
  // Buscar todos os módulos
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*');
  if (modulesError) throw modulesError;

  // Buscar todos os áudios
  const { data: audios, error: audiosError } = await supabase
    .from('audios')
    .select('*');
  if (audiosError) throw audiosError;

  // Montar a estrutura igual ao antigo modulesData, com fallback para campos ausentes
  const modulesWithContents = modules.map(module => ({
    id: module.id,
    name: module.name || module.title || 'Módulo sem nome',
    thumbnail: { uri: module.image1x1_url || 'https://ui-avatars.com/api/?name=Modulo' },
    image1x1: { uri: module.image1x1_url || 'https://ui-avatars.com/api/?name=Modulo' },
    image3x4: { uri: module.image1x1_url || 'https://ui-avatars.com/api/?name=Modulo' },
    contents: audios
      .filter(audio => audio.module_id === module.id)
      .map(audio => ({
        id: audio.id,
        name: audio.name || audio.title || 'Áudio sem nome',
        file: { uri: audio.audio_url },
        duration: audio.duration,
        thumbnail: { uri: audio.thumbnail_url || 'https://ui-avatars.com/api/?name=Audio' },
        image3x4: { uri: audio.thumbnail_url || 'https://ui-avatars.com/api/?name=Audio' }
      }))
  }));

  return modulesWithContents;
}