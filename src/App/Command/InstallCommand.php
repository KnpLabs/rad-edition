<?php

namespace App\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Command\Command;

class InstallCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('app:install')
            ->setDescription('Install and configure your application')
            ->setDefinition(
                array(
                    new InputOption(
                        'no-fixtures',
                        null,
                        InputOption::VALUE_NONE,
                        'Don\'t load doctrine fixtures'
                    )
                )
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln('<info>Installation processing.</info>');
        $output->writeln('');

        $this
            ->setup($input, $output);

        $output->writeln('<info>Your application has been successfully installed.</info>');
    }

    protected function setup(InputInterface $input, OutputInterface $output)
    {
        $this
            ->runCommand('doctrine:database:create', $input, $output)
            ->runCommand('doctrine:schema:create', $input, $output)
            ->runCommand('assetic:dump', $input, $output)
            ->runCommand(
                'assets:install',
                new ArrayInput(
                    array(
                        'command' => 'assets:install',
                        'target' => 'web',
                        '--symlink' => true
                    )
                ),
                $output
            );

        if (false === $input->getOption('no-fixtures')) {
            $this->runCommand('doctrine:fixtures:load', clone $input, $output);
        }

        $output->writeln('');

        return $this;
    }

    private function buildInput(Command $command, InputInterface $input)
    {
        $result = array();

        foreach ($command->getDefinition()->getArguments() as $key => $value) {
            if ($input->hasArgument($key)) {
                $result[$key] = $input->getArgument($key);
            }
        }

        foreach ($command->getDefinition()->getOptions() as $key => $value) {
            if ($input->hasOption($key)) {
                $result[sprintf('--%s', $key)] = $input->getOption($key);
            }
        }

        return new ArrayInput(array_merge($result, array('command' => $command->getName())));
    }

    private function runCommand($command, InputInterface $input, OutputInterface $output)
    {
        $command = $this->getApplication()->find($command);
        $command->run($this->buildInput($command, $input), $output);

        return $this;
    }
}
