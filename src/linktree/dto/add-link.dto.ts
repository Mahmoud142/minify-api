import { IsString, IsNotEmpty, IsUrl, MaxLength } from 'class-validator';

export class AddLinkDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title: string;

    @IsUrl({ require_protocol: true })
    @IsNotEmpty()
    url: string;
}
