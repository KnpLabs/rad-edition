<?php

namespace Knp\RadBundle\Composer;

use Composer\Script\PackageEvent;
use Composer\Script\Event;
use Composer\DependencyResolver\Operation\InstallOperation;
use Composer\Package\PackageInterface;

class RegisterBundle
{
    public static function postPackageInstall(PackageEvent $event)
    {
        $operation = $event->getOperation();
        if (!$operation instanceof InstallOperation) {
            return;
        }

        $package = $operation->getPackage();
        self::registerWithConfig($event, $package);
    }

    public static function registerWithConfig(PackageEvent $event, PackageInterface $package)
    {
        $packageOptions = $package->getExtra();
        if (!isset($packageOptions['register-bundles'])) {
            return;
        }

        $options = self::getOptions($event);
        $registerPath = sprintf('%s/%s',
            getcwd(),
            $options['symfony-app-dir'].'/bundles'
        );

        $classes = (array)$packageOptions['register-bundles'];
        foreach ($classes as $class) {
            $path = $registerPath.'/'.$package->getPrettyName();
            @mkdir(dirname($path), 0777, true);
            file_put_contents(
                $path,
                sprintf('<?php return new %s($this);', $class)
            );
        }
    }

    protected static function getOptions(Event $event)
    {
        $options = array_merge(array(
            'symfony-app-dir' => 'app',
            'symfony-web-dir' => 'web',
        ), $event->getComposer()->getPackage()->getExtra());

        return $options;
    }
}
