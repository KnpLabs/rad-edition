guard 'ctags-composer', :src_path => ["app/config", "src", "spec", "features"], :vendor_path => ["vendor"], :name_patterns => ['\\*.twig', '\\*.yml', '\\*.xml', '\\*.php'] do
  watch(/^(src|spec)\/.*\.php$/)
  watch('composer.lock')
end
