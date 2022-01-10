import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

type NewImageData = {
  url: string;
  title: string;
  description: string;
}


interface FormAddImageProps {
  closeModal: () => void;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const acceptedFormatsRegex =
    /(?:([^:/?#]+):)?(?:([^/?#]*))?([^?#](?:jpeg|gif|png))(?:\?([^#]*))?(?:#(.*))?/g;

  const formValidations = {
    image: {
      // TODO REQUIRED, LESS THAN 10 MB AND ACCEPTED FORMATS VALIDATIONS
      required: {
        value: true,
        message: 'Arquivo obrigatório'
      },
      validate: {
        lessThan10MB: (fileList: { size: number }[]) => {
          const errorMessage = 'O arquivo deve ser menor do que 10MB'
          return fileList[0].size < 10 * Math.pow(10, 6) || errorMessage
        },
        acceptedFormats: (fileList: { type: string }[]) => {
          const errorMessage = 'Somente são aceitos arquivos PNG, JPG e GIF'
          return acceptedFormatsRegex.test(fileList[0].type) || errorMessage
        }

      }

    },
    title: {
      // TODO REQUIRED, MIN AND MAX LENGTH VALIDATIONS
      required: {
        value: true,
        message: 'Título obrigatório'
      },
      minLength: {
        value: 2,
        message: 'Mínimo de 2 caracteres'
      },
      maxLength: {
        value: 20,
        message: 'Máximo de 20 caracteres'
      }
    },
    description: {
      // TODO REQUIRED, MAX LENGTH VALIDATIONS
      required: {
        value: true,
        message: 'Descrição obrigatória'
      },
      maxLength: {
        value: 65,
        message: 'Máximo de 65 caracteres'
      }
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(
    // TODO MUTATION API POST REQUEST,
    async (image: NewImageData) => {
      await api.post('/api/images', {
        ...image,
        url: imageUrl
      });
    },
    {
      // TODO ONSUCCESS MUTATION
      onSuccess: () => { queryClient.invalidateQueries('images') }
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState,
    setError,
    trigger,
  } = useForm();
  const { errors } = formState;

  const onSubmit = async (data: NewImageData): Promise<void> => {
    try {
      // TODO SHOW ERROR TOAST IF IMAGE URL DOES NOT EXISTS
      if (!imageUrl) {
        toast({
          status: 'error',
          title: 'Imagem não adicionada',
          description: 'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.'
        })

        return
      }
      // TODO EXECUTE ASYNC MUTATION
      await mutation.mutateAsync(data);
      // TODO SHOW SUCCESS TOAST
      toast({
        status: 'success',
        title: 'Imagem cadastrada com sucesso!',
        description: 'Sua imagem foi cadastrada com sucesso.',
      });
    } catch {
      // TODO SHOW ERROR TOAST IF SUBMIT FAILED
      toast({
        status: 'error',
        title: 'Falha no cadastrado',
        description: 'Ocorreu um erro ao cadastrar a imagem.',
      });
    } finally {
      // TODO CLEAN FORM, STATES AND CLOSE MODAL
      reset();
      setImageUrl('');
      setLocalImageUrl('');
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          // TODO SEND IMAGE ERRORS
          error={errors.image}
          // TODO REGISTER IMAGE INPUT WITH VALIDATIONS
          {...register('image', formValidations.image)}
        />

        <TextInput
          placeholder="Título da imagem..."
          // TODO SEND TITLE ERRORS
          error={errors.title}
          // TODO REGISTER TITLE INPUT WITH VALIDATIONS
          {...register('title', formValidations.title)}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          // TODO SEND DESCRIPTION ERRORS
          error={errors.description}
          // TODO REGISTER DESCRIPTION INPUT WITH VALIDATIONS
          {...register('description', formValidations.description)}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
