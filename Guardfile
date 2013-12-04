guard 'ctags-composer', :src_path => ["app/config", "src", "spec", "features"], :vendor_path => ["vendor"], :name_patterns => ['\\*.twig', '\\*.yml', '\\*.xml', '\\*.php'] do
  watch(/^(src|spec)\/.*\.php$/)
  watch('composer.lock')
end

guard :shell do
    watch(%r{^spec/.+Spec.php}) { |m|
        `bin/phpspec run --no-interaction -f=pretty #{m[0]}`
    }

    watch(%r{^src/(.+).php}) {
        `bin/phpspec run --no-interaction -f=pretty`
    }

    watch(/^features\/.*\.feature$/) { |m|
        `bin/behat #{m[0]}`
    }
end
